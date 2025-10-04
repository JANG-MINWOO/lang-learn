# Language Learning App - 개선 방안 분석

> 프로젝트의 코드 품질, 유지보수성, 확장성을 향상시키기 위한 종합 분석 및 개선 방안

## 📋 목차

1. [반복되는 코드 패턴](#1-반복되는-코드-패턴)
2. [에러 핸들링 개선](#2-에러-핸들링-개선)
3. [상태 관리 개선](#3-상태-관리-개선)
4. [커스텀 훅 추출](#4-커스텀-훅-추출)
5. [컴포넌트 구조 개선](#5-컴포넌트-구조-개선)
6. [타입 안전성 강화](#6-타입-안전성-강화)
7. [성능 최적화](#7-성능-최적화)
8. [코드 구조 개선](#8-코드-구조-개선)
9. [유효성 검증 개선](#9-유효성-검증-개선)
10. [상수 및 설정 관리](#10-상수-및-설정-관리)
11. [우선순위 요약](#우선순위-요약)
12. [구현 로드맵](#구현-로드맵)

---

## 1. 반복되는 코드 패턴

### 1.1 중복된 Firestore 작업

**우선순위: 🔴 HIGH | 난이도: 🟡 MEDIUM**

**현재 문제점:**
- 모든 페이지에서 Firestore 함수를 직접 import하여 사용
- `Home.tsx`, `DeckDetail.tsx`, `Study.tsx`에 유사한 패턴 반복
- 데이터베이스 작업에 대한 추상화 계층 없음

**예시 (Home.tsx, lines 22-42):**
```typescript
useEffect(() => {
  if (!currentUser) return;

  const q = query(
    collection(db, 'decks'),
    where('userId', '==', currentUser.uid)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const deckData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Deck[];

    setDecks(deckData);
  });

  return () => unsubscribe();
}, [currentUser]);
```

**개선 방안:**

**1) Service Layer 생성**

```typescript
// src/services/deckService.ts
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Deck } from '../types';

export const deckService = {
  // 덱 생성
  async createDeck(userId: string, data: { name: string; description: string }) {
    return addDoc(collection(db, 'decks'), {
      userId,
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  // 덱 수정
  async updateDeck(deckId: string, data: Partial<Deck>) {
    return updateDoc(doc(db, 'decks', deckId), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  // 덱 삭제
  async deleteDeck(deckId: string) {
    return deleteDoc(doc(db, 'decks', deckId));
  },

  // 사용자별 덱 구독
  subscribeToDecksByUser(userId: string, callback: (decks: Deck[]) => void) {
    const q = query(collection(db, 'decks'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const decks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Deck[];
      callback(decks);
    });
  },
};
```

```typescript
// src/services/cardService.ts
export const cardService = {
  async createCard(deckId: string, data: { front: string; back: string; memo: string }) {
    return addDoc(collection(db, 'cards'), {
      deckId,
      ...data,
      interval: 0,
      nextReviewDate: Timestamp.now(),
      easeFactor: 2.5,
      reviewCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  async updateCard(cardId: string, data: Partial<Card>) {
    return updateDoc(doc(db, 'cards', cardId), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteCard(cardId: string) {
    return deleteDoc(doc(db, 'cards', cardId));
  },

  subscribeToCardsByDeck(deckId: string, callback: (cards: Card[]) => void) {
    const q = query(collection(db, 'cards'), where('deckId', '==', deckId));
    return onSnapshot(q, (snapshot) => {
      const cards = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        nextReviewDate: doc.data().nextReviewDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Card[];
      callback(cards);
    });
  },
};
```

**2) Custom Hooks 생성**

```typescript
// src/hooks/useDecks.ts
import { useState, useEffect } from 'react';
import { deckService } from '../services/deckService';
import type { Deck } from '../types';

export function useDecks(userId: string | undefined) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = deckService.subscribeToDecksByUser(
      userId,
      (decks) => {
        setDecks(decks);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { decks, loading, error };
}
```

```typescript
// src/hooks/useCards.ts
export function useCards(deckId: string | undefined) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deckId) {
      setLoading(false);
      return;
    }

    const unsubscribe = cardService.subscribeToCardsByDeck(deckId, (cards) => {
      setCards(cards);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [deckId]);

  return { cards, loading };
}
```

**사용 예시:**
```typescript
// Home.tsx - Before: 20+ lines / After: 2 lines
import { useDecks } from '../hooks/useDecks';

export default function Home() {
  const { currentUser } = useAuth();
  const { decks, loading } = useDecks(currentUser?.uid);
  // ...
}
```

---

### 1.2 중복된 폼 상태 관리

**우선순위: 🟡 MEDIUM | 난이도: 🟢 EASY**

**현재 문제점:**
- `Login.tsx`, `SignUp.tsx`, `Home.tsx`, `DeckDetail.tsx`에서 유사한 폼 상태 패턴 반복
- 재사용 가능한 폼 핸들링 로직 없음

**개선 방안:**

```typescript
// src/hooks/useForm.ts
import { useState, useCallback } from 'react';

export function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = useCallback((field: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValues(prev => ({ ...prev, [field]: e.target.value }));
    // 입력 시 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    setErrors,
    handleChange,
    setValues,
    reset,
  };
}
```

**사용 예시:**
```typescript
const { values, errors, setErrors, handleChange } = useForm({
  email: '',
  password: '',
});

<Input
  value={values.email}
  onChange={handleChange('email')}
  error={errors.email}
/>
```

---

### 1.3 중복된 로딩 상태

**우선순위: 🟡 MEDIUM | 난이도: 🟢 EASY**

**현재 문제점:**
- 모든 페이지에서 개별적인 로딩 상태 관리
- 일관성 없는 로딩 UI 패턴

**개선 방안:**

```typescript
// src/components/common/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  message = '로딩 중...',
  fullScreen = false
}: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? 'min-h-screen bg-white flex items-center justify-center'
    : 'flex items-center justify-center py-8';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
```

---

## 2. 에러 핸들링 개선

### 2.1 일관성 없는 에러 처리

**우선순위: 🔴 HIGH | 난이도: 🟡 MEDIUM**

**현재 문제점:**
- `console.error` + `alert` 사용 (나쁜 UX)
- 중앙화된 에러 처리 없음
- Firebase 에러 메시지가 사용자 친화적이지 않음

**개선 방안:**

**1) Toast Context 생성**

```typescript
// src/contexts/ToastContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast['type']) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast UI */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'success' ? 'bg-green-500' :
              'bg-blue-500'
            } text-white animate-slide-in`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
```

**2) 에러 핸들러 유틸리티**

```typescript
// src/utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleFirebaseError(error: any): string {
  const errorMap: Record<string, string> = {
    'auth/user-not-found': '사용자를 찾을 수 없습니다',
    'auth/wrong-password': '비밀번호가 올바르지 않습니다',
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다',
    'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다',
    'auth/weak-password': '비밀번호가 너무 약합니다 (최소 6자)',
    'permission-denied': '권한이 없습니다',
    'not-found': '요청한 데이터를 찾을 수 없습니다',
  };

  return errorMap[error.code] || '오류가 발생했습니다. 다시 시도해주세요.';
}
```

**사용 예시:**
```typescript
import { useToast } from '../contexts/ToastContext';
import { handleFirebaseError } from '../utils/errorHandler';

const { showToast } = useToast();

try {
  await deckService.createDeck(userId, data);
  showToast('덱이 생성되었습니다', 'success');
} catch (error) {
  const message = handleFirebaseError(error);
  showToast(message, 'error');
}
```

---

## 3. 상태 관리 개선

### 3.1 덱/카드 카운트 정보 부재

**우선순위: 🟡 MEDIUM | 난이도: 🟡 MEDIUM**

**현재 문제점:**
- `DeckCard` 컴포넌트가 하드코딩된 `cardCount={0}`, `dueCount={0}` 받음
- 실제 카드 수를 계산할 방법 없음

**개선 방안:**

```typescript
// src/contexts/DataContext.tsx
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { deckService, cardService } from '../services';
import type { Deck, Card } from '../types';

interface DataContextType {
  decks: Deck[];
  cards: Card[];
  getDeckCardCount: (deckId: string) => number;
  getDeckDueCount: (deckId: string) => number;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const unsubscribeDecks = deckService.subscribeToDecksByUser(
      currentUser.uid,
      setDecks
    );

    // 모든 카드 구독 (덱별 카운트 계산용)
    const unsubscribeCards = cardService.subscribeToAllUserCards(
      currentUser.uid,
      (allCards) => {
        setCards(allCards);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeDecks();
      unsubscribeCards();
    };
  }, [currentUser]);

  const getDeckCardCount = (deckId: string) => {
    return cards.filter((card) => card.deckId === deckId).length;
  };

  const getDeckDueCount = (deckId: string) => {
    const today = new Date();
    return cards.filter(
      (card) => card.deckId === deckId && card.nextReviewDate <= today
    ).length;
  };

  return (
    <DataContext.Provider
      value={{ decks, cards, getDeckCardCount, getDeckDueCount, loading }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
```

**사용 예시:**
```typescript
// Home.tsx
const { decks, getDeckCardCount, getDeckDueCount } = useData();

{decks.map((deck) => (
  <DeckCard
    key={deck.id}
    name={deck.name}
    description={deck.description}
    cardCount={getDeckCardCount(deck.id)}
    dueCount={getDeckDueCount(deck.id)}
    onClick={() => navigate(`/deck/${deck.id}`)}
  />
))}
```

---

## 4. 커스텀 훅 추출

### 4.1 간격 반복 알고리즘 추출

**우선순위: 🔴 HIGH | 난이도: 🟢 EASY**

**현재 문제점:**
- `Study.tsx`에 간격 반복 알고리즘이 하드코딩됨 (lines 94-124)
- 재사용 및 테스트가 어려움

**개선 방안:**

```typescript
// src/hooks/useSpacedRepetition.ts
import { Difficulty, Card } from '../types';
import { STUDY_CONFIG } from '../utils/constants';

interface SpacedRepetitionResult {
  interval: number;
  easeFactor: number;
  nextReviewDate: Date;
}

export function useSpacedRepetition() {
  const calculateNextReview = (
    card: Card,
    difficulty: Difficulty
  ): SpacedRepetitionResult => {
    let newInterval = card.interval;
    let newEaseFactor = card.easeFactor;

    const config = STUDY_CONFIG.DIFFICULTY_ADJUSTMENTS[difficulty];
    const minInterval = STUDY_CONFIG.MIN_INTERVALS[difficulty];

    switch (difficulty) {
      case Difficulty.AGAIN:
        newInterval = 0;
        newEaseFactor = Math.max(
          STUDY_CONFIG.MIN_EASE_FACTOR,
          card.easeFactor + config.easeChange
        );
        break;
      case Difficulty.HARD:
        newInterval = Math.max(minInterval, card.interval * config.intervalMultiplier);
        newEaseFactor = Math.max(
          STUDY_CONFIG.MIN_EASE_FACTOR,
          card.easeFactor + config.easeChange
        );
        break;
      case Difficulty.GOOD:
        newInterval = Math.max(minInterval, card.interval * config.intervalMultiplier);
        break;
      case Difficulty.EASY:
        newInterval = Math.max(minInterval, card.interval * config.intervalMultiplier);
        newEaseFactor = card.easeFactor + config.easeChange;
        break;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + Math.ceil(newInterval));

    return {
      interval: newInterval,
      easeFactor: newEaseFactor,
      nextReviewDate,
    };
  };

  return { calculateNextReview };
}
```

---

### 4.2 키보드 단축키 훅

**우선순위: 🔵 LOW | 난이도: 🟢 EASY**

**개선 방안:**

```typescript
// src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';

type ShortcutHandler = () => void;
interface Shortcuts {
  [key: string]: ShortcutHandler;
}

export function useKeyboardShortcuts(
  shortcuts: Shortcuts,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts, enabled]);
}
```

**사용 예시:**
```typescript
// Study.tsx
import { KEYBOARD_SHORTCUTS } from '../utils/constants';

useKeyboardShortcuts(
  {
    [KEYBOARD_SHORTCUTS.FLIP_CARD]: () => !isFlipped && setIsFlipped(true),
    [KEYBOARD_SHORTCUTS.AGAIN]: () => isFlipped && handleAnswer(Difficulty.AGAIN),
    [KEYBOARD_SHORTCUTS.HARD]: () => isFlipped && handleAnswer(Difficulty.HARD),
    [KEYBOARD_SHORTCUTS.GOOD]: () => isFlipped && handleAnswer(Difficulty.GOOD),
    [KEYBOARD_SHORTCUTS.EASY]: () => isFlipped && handleAnswer(Difficulty.EASY),
  },
  !isComplete
);
```

---

## 5. 컴포넌트 구조 개선

### 5.1 Textarea 컴포넌트 생성

**우선순위: 🔵 LOW | 난이도: 🟢 EASY**

**현재 문제점:**
- `Home.tsx`, `DeckDetail.tsx`에 textarea 코드 중복

**개선 방안:**

```typescript
// src/components/common/Textarea.tsx
import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({
  label,
  error,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors resize-none ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

---

### 5.2 StudyCard 컴포넌트 분리

**우선순위: 🟡 MEDIUM | 난이도: 🟢 EASY**

**개선 방안:**

```typescript
// src/components/study/StudyCard.tsx
interface StudyCardProps {
  frontText: string;
  backText: string;
  memo?: string;
  isFlipped: boolean;
  isReversed: boolean;
  onFlip: () => void;
}

export default function StudyCard({
  frontText,
  backText,
  memo,
  isFlipped,
  isReversed,
  onFlip,
}: StudyCardProps) {
  return (
    <div
      className="bg-white border-4 border-black rounded-2xl p-12 min-h-[400px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onFlip}
    >
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-4">
          {isReversed ? '뜻' : '단어/문장'}
        </p>
        <p className="text-4xl font-bold text-black mb-8">{frontText}</p>

        {isFlipped ? (
          <>
            <div className="border-t-2 border-gray-300 my-6 w-32 mx-auto" />
            <p className="text-sm text-gray-500 mb-2">
              {isReversed ? '단어/문장' : '뜻'}
            </p>
            <p className="text-2xl text-gray-700 mb-4">{backText}</p>

            {memo && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">메모</p>
                <p className="text-sm text-gray-600">{memo}</p>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-400 text-sm">
            카드 클릭 또는 스페이스바로 답 확인
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## 6. 타입 안전성 강화

### 6.1 타입 가드 추가

**우선순위: 🟡 MEDIUM | 난이도: 🟢 EASY**

**개선 방안:**

```typescript
// src/types/guards.ts
import type { User, Deck, Card } from './index';

export function isValidDeck(data: any): data is Deck {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.userId === 'string' &&
    typeof data.name === 'string' &&
    data.createdAt instanceof Date &&
    data.updatedAt instanceof Date
  );
}

export function isValidCard(data: any): data is Card {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.deckId === 'string' &&
    typeof data.front === 'string' &&
    typeof data.back === 'string' &&
    typeof data.interval === 'number' &&
    data.nextReviewDate instanceof Date
  );
}

export function isValidUser(data: any): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.uid === 'string' &&
    typeof data.email === 'string' &&
    typeof data.nickname === 'string'
  );
}
```

---

### 6.2 Firebase 타입 안전성 개선

**우선순위: 🟡 MEDIUM | 난이도: 🟡 MEDIUM**

**개선 방안:**

```typescript
// src/types/firebase.ts
import { Timestamp } from 'firebase/firestore';

export type FirestoreTimestamp = Timestamp | Date;

// Firestore 문서 타입 (서버)
export interface DeckDocument {
  userId: string;
  name: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CardDocument {
  deckId: string;
  front: string;
  back: string;
  memo: string;
  interval: number;
  nextReviewDate: Timestamp;
  easeFactor: number;
  reviewCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserDocument {
  uid: string;
  email: string;
  nickname: string;
  phoneNumber: string;
  createdAt: Timestamp;
}

// 타임스탬프 변환 헬퍼
export function convertFirestoreDate(
  timestamp: Timestamp | Date | undefined
): Date | undefined {
  if (!timestamp) return undefined;
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

// 문서 → 앱 타입 변환
export function convertDeckDocument(id: string, doc: DeckDocument): Deck {
  return {
    id,
    userId: doc.userId,
    name: doc.name,
    description: doc.description,
    createdAt: convertFirestoreDate(doc.createdAt)!,
    updatedAt: convertFirestoreDate(doc.updatedAt)!,
  };
}
```

---

## 7. 성능 최적화

### 7.1 불필요한 리렌더링 방지

**우선순위: 🟡 MEDIUM | 난이도: 🟡 MEDIUM**

**개선 방안:**

```typescript
// src/components/deck/DeckCard.tsx
import { memo } from 'react';

export default memo(function DeckCard({
  name,
  description,
  cardCount,
  dueCount,
  onClick,
}: DeckCardProps) {
  // ... 컴포넌트 코드
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수 (선택적)
  return (
    prevProps.name === nextProps.name &&
    prevProps.cardCount === nextProps.cardCount &&
    prevProps.dueCount === nextProps.dueCount
  );
});
```

```typescript
// 부모 컴포넌트에서 useCallback 사용
import { useCallback } from 'react';

const handleCreateDeck = useCallback(async (e: React.FormEvent) => {
  e.preventDefault();
  // ... 로직
}, [newDeck.name, newDeck.description, currentUser]);
```

---

### 7.2 Firestore 쿼리 최적화

**우선순위: 🔴 HIGH | 난이도: 🟡 MEDIUM**

**현재 문제점:**
- `Study.tsx`에서 모든 카드를 가져온 후 클라이언트에서 필터링
- 배치 읽기나 페이지네이션 없음

**개선 방안:**

```typescript
// src/services/cardService.ts
import { getDocs, query, where, limit, orderBy, Timestamp } from 'firebase/firestore';

export const cardService = {
  // 학습용 카드 가져오기 (최적화)
  async getStudyCards(deckId: string, maxCards: number = 10): Promise<Card[]> {
    const today = Timestamp.now();

    // 1. 복습이 필요한 카드 우선
    const dueQuery = query(
      collection(db, 'cards'),
      where('deckId', '==', deckId),
      where('nextReviewDate', '<=', today),
      orderBy('nextReviewDate', 'asc'),
      limit(maxCards)
    );

    const dueSnapshot = await getDocs(dueQuery);

    // 충분한 카드가 있으면 반환
    if (dueSnapshot.size >= maxCards) {
      return dueSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        nextReviewDate: doc.data().nextReviewDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Card[];
    }

    // 2. 부족하면 전체 카드에서 추가
    const remaining = maxCards - dueSnapshot.size;
    const allQuery = query(
      collection(db, 'cards'),
      where('deckId', '==', deckId),
      orderBy('createdAt', 'desc'),
      limit(remaining)
    );

    const allSnapshot = await getDocs(allQuery);

    const dueCards = dueSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Card[];

    const additionalCards = allSnapshot.docs
      .filter(doc => !dueCards.some(card => card.id === doc.id))
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Card[];

    return [...dueCards, ...additionalCards];
  },
};
```

---

## 8. 코드 구조 개선

### 8.1 폴더 구조 재구성

**우선순위: 🔴 HIGH | 난이도: 🟢 EASY**

**현재 문제점:**
- 빈 `hooks` 폴더
- `services` 폴더 없음
- `utils` 폴더 없음
- 상수 파일 없음

**제안하는 구조:**

```
src/
├── components/
│   ├── common/              # 공통 재사용 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   ├── deck/               # 덱 관련 컴포넌트
│   │   └── DeckCard.tsx
│   ├── study/              # 학습 관련 컴포넌트
│   │   ├── StudyCard.tsx
│   │   └── DifficultyButtons.tsx
│   └── ProtectedRoute.tsx
├── config/
│   └── firebase.ts
├── contexts/
│   ├── AuthContext.tsx
│   ├── DataContext.tsx     # 새로 추가
│   └── ToastContext.tsx    # 새로 추가
├── hooks/
│   ├── useForm.ts
│   ├── useDecks.ts
│   ├── useCards.ts
│   ├── useSpacedRepetition.ts
│   └── useKeyboardShortcuts.ts
├── pages/
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── SignUp.tsx
│   ├── DeckDetail.tsx
│   └── Study.tsx
├── services/               # 새로 추가
│   ├── deckService.ts
│   ├── cardService.ts
│   └── userService.ts
├── types/
│   ├── index.ts
│   ├── guards.ts           # 새로 추가
│   └── firebase.ts         # 새로 추가
├── utils/                  # 새로 추가
│   ├── errorHandler.ts
│   ├── validators.ts
│   └── constants.ts
├── App.tsx
└── main.tsx
```

---

## 9. 유효성 검증 개선

### 9.1 검증 로직 중앙화

**우선순위: 🟡 MEDIUM | 난이도: 🟢 EASY**

**현재 문제점:**
- `SignUp.tsx`에 검증 로직이 컴포넌트와 혼재

**개선 방안:**

```typescript
// src/utils/validators.ts
export const validators = {
  email: (value: string): string | undefined => {
    if (!value) return '이메일을 입력해주세요';
    if (!/\S+@\S+\.\S+/.test(value)) return '올바른 이메일 형식이 아닙니다';
    return undefined;
  },

  password: (value: string): string | undefined => {
    if (!value) return '비밀번호를 입력해주세요';
    if (value.length < 6) return '비밀번호는 최소 6자 이상이어야 합니다';
    return undefined;
  },

  confirmPassword: (password: string, confirmPassword: string): string | undefined => {
    if (password !== confirmPassword) return '비밀번호가 일치하지 않습니다';
    return undefined;
  },

  required: (value: string, fieldName: string): string | undefined => {
    if (!value || !value.trim()) return `${fieldName}을(를) 입력해주세요`;
    return undefined;
  },

  phoneNumber: (value: string): string | undefined => {
    if (!value) return '전화번호를 입력해주세요';
    const phoneRegex = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
    if (!phoneRegex.test(value)) {
      return '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)';
    }
    return undefined;
  },

  minLength: (value: string, min: number, fieldName: string): string | undefined => {
    if (value.length < min) {
      return `${fieldName}은(는) 최소 ${min}자 이상이어야 합니다`;
    }
    return undefined;
  },

  maxLength: (value: string, max: number, fieldName: string): string | undefined => {
    if (value.length > max) {
      return `${fieldName}은(는) 최대 ${max}자까지 입력 가능합니다`;
    }
    return undefined;
  },
};
```

**검증 기능이 강화된 useForm:**

```typescript
// src/hooks/useForm.ts (개선 버전)
import { useState, useCallback } from 'react';

type Validator<T> = (value: any, values: T) => string | undefined;

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: Partial<Record<keyof T, Validator<T>>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  // 전체 폼 검증
  const validate = useCallback((): boolean => {
    if (!validationSchema) return true;

    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationSchema).forEach((key) => {
      const validator = validationSchema[key as keyof T];
      if (validator) {
        const error = validator(values[key as keyof T], values);
        if (error) {
          newErrors[key as keyof T] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationSchema]);

  // 필드별 검증
  const validateField = useCallback((field: keyof T): boolean => {
    if (!validationSchema || !validationSchema[field]) return true;

    const error = validationSchema[field]!(values[field], values);
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  }, [values, validationSchema]);

  const handleChange = useCallback((field: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValues(prev => ({ ...prev, [field]: e.target.value }));
    setTouched(prev => ({ ...prev, [field]: true }));

    // 입력 시 해당 필드 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleBlur = useCallback((field: keyof T) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  }, [validateField]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    validateField,
    setValues,
    setErrors,
    reset,
  };
}
```

**사용 예시:**
```typescript
// SignUp.tsx
import { useForm } from '../hooks/useForm';
import { validators } from '../utils/validators';

const { values, errors, touched, handleChange, handleBlur, validate } = useForm(
  {
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    phoneNumber: '',
  },
  {
    email: validators.email,
    password: validators.password,
    confirmPassword: (value, values) =>
      validators.confirmPassword(values.password, value),
    nickname: (value) => validators.required(value, '닉네임'),
    phoneNumber: validators.phoneNumber,
  }
);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;
  // ... 제출 로직
};
```

---

## 10. 상수 및 설정 관리

### 10.1 매직 넘버/문자열 제거

**우선순위: 🔵 LOW | 난이도: 🟢 EASY**

**개선 방안:**

```typescript
// src/utils/constants.ts

// 학습 관련 설정
export const STUDY_CONFIG = {
  MAX_CARDS_PER_SESSION: 10,
  MIN_EASE_FACTOR: 1.3,
  DEFAULT_EASE_FACTOR: 2.5,

  DIFFICULTY_ADJUSTMENTS: {
    AGAIN: { intervalMultiplier: 0, easeChange: -0.2 },
    HARD: { intervalMultiplier: 1.2, easeChange: -0.15 },
    GOOD: { intervalMultiplier: 2.5, easeChange: 0 },
    EASY: { intervalMultiplier: 4, easeChange: 0.1 },
  },

  MIN_INTERVALS: {
    AGAIN: 0,  // 즉시 재출제
    HARD: 1,   // 최소 1일
    GOOD: 3,   // 최소 3일
    EASY: 7,   // 최소 7일
  },
} as const;

// 라우트 경로
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DECK_DETAIL: (id: string) => `/deck/${id}`,
  STUDY: (id: string) => `/study/${id}`,
} as const;

// 키보드 단축키
export const KEYBOARD_SHORTCUTS = {
  FLIP_CARD: ' ',
  AGAIN: '1',
  HARD: '2',
  GOOD: '3',
  EASY: '4',
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  DEFAULT: '오류가 발생했습니다. 다시 시도해주세요.',
  NETWORK: '네트워크 오류가 발생했습니다.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  NOT_FOUND: '요청한 데이터를 찾을 수 없습니다.',
  PERMISSION_DENIED: '권한이 없습니다.',
} as const;

// UI 설정
export const UI_CONFIG = {
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
} as const;

// Firestore 컬렉션 이름
export const COLLECTIONS = {
  USERS: 'users',
  DECKS: 'decks',
  CARDS: 'cards',
  SESSIONS: 'sessions',
} as const;
```

---

## 우선순위 요약

### 🔴 HIGH Priority (필수 수정)

1. **Service Layer 생성** - Firebase 작업을 서비스로 추상화
2. **에러 핸들링 시스템** - Toast 알림으로 대체
3. **덱 카드 카운트 수정** - 실제 카드 수 계산 로직 구현
4. **폴더 구조 재구성** - services, utils, hooks 폴더 생성
5. **Firestore 쿼리 최적화** - 배치 읽기 및 페이지네이션

### 🟡 MEDIUM Priority (권장 수정)

1. **Custom Hooks 추출** - useDecks, useCards, useForm, useSpacedRepetition
2. **타입 안전성 개선** - 타입 가드 및 Firebase 타입 추가
3. **컴포넌트 최적화** - React.memo 및 useCallback 사용
4. **검증 로직 중앙화** - validators 유틸리티로 이동
5. **로딩 상태 통일** - LoadingSpinner 컴포넌트 생성

### 🔵 LOW Priority (선택 개선)

1. **키보드 단축키 훅** - 재사용 가능한 키보드 핸들링
2. **컴포넌트 분리** - Textarea, StudyCard 컴포넌트
3. **상수 파일 생성** - 매직 넘버/문자열 제거

---

## 구현 로드맵

### Phase 1: 기반 구조 (1주차)

**목표:** 프로젝트 기반 구조 구축

- [ ] 폴더 구조 재구성 (services, utils, enhanced hooks)
- [ ] Service Layer 구현 (deckService, cardService)
- [ ] 에러 핸들링 시스템 구축 (ToastContext, errorHandler)
- [ ] 상수 파일 생성

**예상 작업량:** 10-15시간

### Phase 2: 상태 & 데이터 (2주차)

**목표:** 데이터 흐름 및 상태 관리 개선

- [ ] DataContext 구현 (전역 상태)
- [ ] Custom Hooks 생성 (useDecks, useCards, useForm)
- [ ] 덱 카드 카운트 계산 로직 수정
- [ ] Firestore 쿼리 최적화

**예상 작업량:** 12-18시간

### Phase 3: 최적화 & 개선 (3주차)

**목표:** 성능 및 사용자 경험 향상

- [ ] React.memo 및 useCallback 적용
- [ ] 검증 시스템 구현 (validators)
- [ ] 재사용 컴포넌트 추출 (Textarea, StudyCard, LoadingSpinner)
- [ ] useSpacedRepetition 훅 추출

**예상 작업량:** 10-12시간

### Phase 4: 타입 안전성 & 문서화 (4주차)

**목표:** 코드 품질 및 유지보수성 향상

- [ ] 타입 가드 추가
- [ ] Firebase 타입 안전성 개선
- [ ] 모든 서비스 및 훅 JSDoc 문서화
- [ ] README 업데이트

**예상 작업량:** 8-10시간

---

## 추가 권장 사항

### 1. 테스트 추가

```typescript
// src/hooks/__tests__/useSpacedRepetition.test.ts
import { renderHook } from '@testing-library/react-hooks';
import { useSpacedRepetition } from '../useSpacedRepetition';
import { Difficulty } from '../../types';

describe('useSpacedRepetition', () => {
  it('should calculate correct interval for EASY difficulty', () => {
    const { result } = renderHook(() => useSpacedRepetition());
    const card = {
      interval: 1,
      easeFactor: 2.5,
      // ... other fields
    };

    const { interval, easeFactor } = result.current.calculateNextReview(
      card,
      Difficulty.EASY
    );

    expect(interval).toBeGreaterThanOrEqual(7);
    expect(easeFactor).toBeGreaterThan(card.easeFactor);
  });
});
```

### 2. 로깅 시스템

```typescript
// src/utils/logger.ts
const isDev = import.meta.env.DEV;

export const logger = {
  info: (message: string, data?: any) => {
    if (isDev) console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    if (isDev) console.error(`[ERROR] ${message}`, error);
    // 프로덕션에서는 에러 추적 서비스로 전송
  },
  warn: (message: string, data?: any) => {
    if (isDev) console.warn(`[WARN] ${message}`, data);
  },
};
```

### 3. 환경별 설정

```typescript
// src/config/env.ts
export const config = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL || '',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  maxCardsPerSession: Number(import.meta.env.VITE_MAX_CARDS_PER_SESSION) || 10,
};
```

---

## 결론

이 개선 방안을 단계적으로 적용하면:

✅ **코드 재사용성** 향상 (중복 코드 80% 감소)
✅ **유지보수성** 개선 (모듈화된 구조)
✅ **타입 안전성** 강화 (런타임 에러 감소)
✅ **성능** 최적화 (불필요한 리렌더링 방지)
✅ **개발 생산성** 증가 (재사용 가능한 훅/서비스)
✅ **확장성** 확보 (새로운 기능 추가 용이)

특히 **Service Layer**, **에러 핸들링**, **폴더 구조 재구성**은 최우선으로 적용하는 것을 권장합니다.

---

## 📋 실행 Todo List

### 🎯 Phase 1: 기반 구조 구축 (우선순위: 최상)

#### Task 1.1: 폴더 구조 재구성 (30분) ✅
- [x] `src/services/` 폴더 생성
- [x] `src/utils/` 폴더 생성
- [x] `src/hooks/` 폴더 내 커스텀 훅용 서브폴더 구조 정리
- [x] `src/components/common/` 폴더 생성 (재사용 컴포넌트용)
- [x] `src/components/deck/` 폴더 생성 및 DeckCard 이동
- [x] `src/types/guards.ts` 파일 생성 준비
- [x] `src/types/firebase.ts` 파일 생성 준비

#### Task 1.2: 상수 파일 생성 (20분) ✅
- [x] `src/utils/constants.ts` 생성
  - [x] `STUDY_CONFIG` - 학습 관련 설정 (MAX_CARDS_PER_SESSION, EASE_FACTOR 등)
  - [x] `ROUTES` - 라우트 경로 상수
  - [x] `KEYBOARD_SHORTCUTS` - 키보드 단축키 맵핑
  - [x] `ERROR_MESSAGES` - 에러 메시지 템플릿
  - [x] `UI_CONFIG` - Toast 지속시간, 애니메이션 등
  - [x] `COLLECTIONS` - Firestore 컬렉션 이름
- [x] 기존 코드에서 매직 넘버/문자열 찾아서 상수로 교체
  - [x] `Study.tsx` - 키보드 단축키, 학습 알고리즘 상수, 컬렉션 이름
  - [x] `Home.tsx` - 컬렉션 이름
  - [x] `DeckDetail.tsx` - 컬렉션 이름, DEFAULT_EASE_FACTOR

#### Task 1.3: Service Layer 구현 (2-3시간)
- [x] `src/services/deckService.ts` 생성 ✅
  - [x] `getDeck(deckId)` - 덱 조회
  - [x] `createDeck(userId, data)` - 덱 생성
  - [x] `updateDeck(deckId, data)` - 덱 수정
  - [x] `deleteDeck(deckId)` - 덱 삭제
  - [x] `subscribeToDecksByUser(userId, callback)` - 사용자 덱 구독
  - [x] Timestamp 자동 처리 로직 포함

- [x] 페이지에서 deckService 적용 ✅
  - [x] `Home.tsx` - subscribeToDecksByUser, createDeck 사용 (20줄 → 2줄로 단축)
  - [x] `DeckDetail.tsx` - getDeck 사용

- [x] `src/services/cardService.ts` 생성 ✅
  - [x] `createCard(deckId, data)` - 카드 생성
  - [x] `updateCard(cardId, data)` - 카드 수정 (Date → Timestamp 자동 변환)
  - [x] `deleteCard(cardId)` - 카드 삭제
  - [x] `subscribeToCardsByDeck(deckId, callback)` - 덱별 카드 구독
  - [x] `subscribeToCardsByDecks(deckIds, callback)` - 여러 덱 카드 구독
  - [x] `getStudyCards(deckId, maxCards)` - 학습용 카드 조회 (최적화)
  - [x] 기본값 설정 (interval: 0, easeFactor: 2.5, reviewCount: 0 등)

- [x] 페이지에서 cardService 적용 ✅
  - [x] `DeckDetail.tsx` - createCard, updateCard, deleteCard, subscribeToCardsByDeck 사용
  - [x] `Study.tsx` - getStudyCards, updateCard 사용 (복습 우선 로직 서비스로 이동)
  - [x] `Home.tsx` - subscribeToCardsByDecks 사용 (20줄 → 3줄로 단축)

- [x] `src/services/userService.ts` 생성 ✅
  - [x] `createUserProfile(uid, data)` - 사용자 프로필 생성 (Timestamp 자동 처리)
  - [x] `updateUserProfile(uid, data)` - 프로필 수정
  - [x] `getUserProfile(uid)` - 프로필 조회

- [x] 페이지에서 userService 적용 ✅
  - [x] `SignUp.tsx` - createUserProfile 사용 (Firestore 작업 간소화)

#### Task 1.4: 에러 핸들링 시스템 구축 (2시간) ✅
- [x] `src/contexts/ToastContext.tsx` 생성
  - [x] Toast 상태 관리 (success, error, info)
  - [x] `showToast(message, type)` 함수
  - [x] 자동 3초 후 사라지는 로직
  - [x] Toast UI 컴포넌트 (우측 하단 고정)
  - [x] 애니메이션 효과 (slide-in)

- [x] `src/utils/errorHandler.ts` 생성
  - [x] `AppError` 클래스 정의
  - [x] `handleFirebaseError(error)` - Firebase 에러 → 한글 메시지 변환
  - [x] 에러 코드 맵핑 (auth/user-not-found, auth/wrong-password 등)
  - [x] `processError(error, context)` - 로깅 + 에러 처리 통합 함수

- [x] `App.tsx`에 ToastProvider 추가
- [x] `tailwind.config.js`에 slide-in 애니메이션 추가
- [x] 모든 페이지에서 `console.error` + `alert` → `useToast()` + `processError()` 교체
  - [x] `Login.tsx` 에러 핸들링 개선 (로그인 성공/실패 toast)
  - [x] `SignUp.tsx` 에러 핸들링 개선 (회원가입 성공/실패 toast)
  - [x] `Home.tsx` 에러 핸들링 개선 (덱 생성 성공/실패, 로그아웃 에러 toast)
  - [x] `DeckDetail.tsx` 에러 핸들링 개선 (카드 추가/수정/삭제 성공/실패 toast)
  - [x] `Study.tsx` 에러 핸들링 개선 (카드 가져오기/업데이트 에러 toast)

---

### 🎯 Phase 2: Custom Hooks & 재사용성 개선

#### Task 2.1: 데이터 훅 생성 (1-2시간) ✅
- [x] `src/hooks/useDecks.ts` 생성
  - [x] `useDecks(userId)` - 덱 목록 + 로딩 상태 + 에러 상태
  - [x] deckService 활용 (subscribeToDecksByUser)
  - [x] JSDoc 문서화 추가

- [x] `src/hooks/useCards.ts` 생성
  - [x] `useCards(deckId)` - 카드 목록 + 로딩 상태 + 에러 상태
  - [x] cardService 활용 (subscribeToCardsByDeck)
  - [x] JSDoc 문서화 추가

- [x] `Home.tsx`에서 훅 적용 (덱 구독 로직 10줄 → 1줄로 단축)
- [x] `DeckDetail.tsx`에서 훅 적용 (카드 구독 로직 7줄 → 1줄로 단축)

#### Task 2.2: 폼 훅 생성 (1시간) ✅
- [x] `src/hooks/useForm.ts` 생성
  - [x] `values`, `errors`, `touched` 상태 관리
  - [x] `handleChange(field)` 핸들러
  - [x] `handleBlur(field)` 핸들러
  - [x] `validate()` - 전체 폼 검증
  - [x] `validateField(field)` - 필드별 검증
  - [x] `reset()` - 초기화
  - [x] `setFieldError()`, `setFieldValue()` 유틸리티 추가
  - [x] JSDoc 문서화

- [x] `Login.tsx`에서 useForm 적용 (검증 로직 13줄 → 4줄로 단축)
- [x] `SignUp.tsx`에서 useForm 적용 (검증 로직 29줄 → 15줄로 단축)
- [x] `Home.tsx` (덱 생성 모달)에서 useForm 적용 (폼 상태 관리 간소화)
- [x] `DeckDetail.tsx` (카드 추가)에서 useForm 적용 (폼 상태 관리 간소화)

#### Task 2.3: 학습 알고리즘 훅 생성 (30분) ✅
- [x] `src/hooks/useSpacedRepetition.ts` 생성
  - [x] `calculateNextReview(card, difficulty)` 함수
  - [x] STUDY_CONFIG 상수 활용
  - [x] SuperMemo SM-2 알고리즘 로직 이동
  - [x] JSDoc 문서화 및 타입 정의

- [x] `Study.tsx`에서 훅 적용 (알고리즘 로직 40줄 제거, 재사용 가능한 훅으로 분리)

#### Task 2.4: 키보드 단축키 훅 생성 (30분) ✅
- [x] `src/hooks/useKeyboardShortcuts.ts` 생성
  - [x] 단축키 맵 + 핸들러 받기
  - [x] enabled 플래그로 활성화/비활성화
  - [x] 이벤트 리스너 자동 등록/해제
  - [x] Space 키 특수 처리 (key, code 모두 지원)
  - [x] JSDoc 문서화

- [x] `Study.tsx`에서 훅 적용 (키보드 이벤트 로직 25줄 → 8줄로 단축)

---

### 🎯 Phase 3: 컴포넌트 & 검증 개선

#### Task 3.1: 공통 컴포넌트 추가 (1시간) ✅
- [x] `src/components/common/Textarea.tsx` 생성
  - [x] label, error props 지원
  - [x] Input 컴포넌트와 스타일 일관성 유지
  - [x] TypeScript type import 적용

- [x] `src/components/common/LoadingSpinner.tsx` 생성
  - [x] fullScreen 옵션
  - [x] 커스텀 메시지 지원
  - [x] 일관된 로딩 UI
  - [x] JSDoc 문서화

- [x] `src/components/study/StudyCard.tsx` 생성
  - [x] Study.tsx에서 카드 UI 분리 (35줄 → 컴포넌트로 추출)
  - [x] frontText, backText, memo, isFlipped, isReversed, onFlip props
  - [x] JSDoc 문서화

- [x] 모든 페이지에서 공통 컴포넌트 적용
  - [x] `Study.tsx` - LoadingSpinner, StudyCard 사용 (40줄 감소)
  - [x] `DeckDetail.tsx` - LoadingSpinner, Textarea 사용 (10줄 감소)
  - [x] `Home.tsx` - Textarea 사용 (7줄 감소)

#### Task 3.2: 검증 시스템 구축 (1시간) ✅
- [x] `src/utils/validators.ts` 생성
  - [x] `email(value)` - 이메일 검증 (정규식 기반)
  - [x] `password(value)` - 비밀번호 검증 (최소 6자)
  - [x] `confirmPassword(password, confirm)` - 비밀번호 확인 (일치 여부)
  - [x] `required(value, fieldName)` - 필수 입력 (trim 처리)
  - [x] `phoneNumber(value)` - 전화번호 검증 (010-1234-5678 형식)
  - [x] `minLength(value, min, fieldName)` - 최소 길이
  - [x] `maxLength(value, max, fieldName)` - 최대 길이
  - [x] JSDoc 문서화 및 named export/default export 지원

- [x] useForm 훅에 validationSchema 통합 (이미 Phase 2에서 완료됨)
- [x] 모든 폼에서 validators 적용
  - [x] `Login.tsx` - email, password 검증 (인라인 로직 → validators 함수 사용)
  - [x] `SignUp.tsx` - email, password, confirmPassword, nickname, phoneNumber 검증 (15줄 → 5줄로 단축)
  - [x] `Home.tsx` - 덱 이름 required 검증
  - [x] `DeckDetail.tsx` - 카드 앞면/뒷면 required 검증

---

### 🎯 Phase 4: 타입 안전성 & 성능 최적화

#### Task 4.1: 타입 가드 추가 (1시간) ✅
- [x] `src/types/guards.ts` 생성
  - [x] `isValidDeck(data)` - Deck 타입 검증 (모든 필수 필드 검증)
  - [x] `isValidCard(data)` - Card 타입 검증 (모든 필수 필드 검증)
  - [x] `isValidUser(data)` - User 타입 검증 (모든 필수 필드 검증)
  - [x] `isValidDeckArray(data)`, `isValidCardArray(data)` - 배열 타입 검증
  - [x] `hasRequiredDeckFields()`, `hasRequiredCardFields()`, `hasRequiredUserFields()` - 부분 검증 함수
  - [x] JSDoc 문서화

- [x] 서비스 레이어에서 타입 가드 활용
  - [x] `deckService.ts` - getDeck, createDeck, subscribeToDecksByUser에 타입 가드 적용
  - [x] `cardService.ts` - createCard, subscribeToCardsByDeck, subscribeToCardsByDecks, getStudyCards에 타입 가드 적용
  - [x] 런타임 검증: 유효하지 않은 데이터는 console.warn 후 필터링
  - [x] 생성 시 필수 필드 검증: 유효하지 않으면 Error throw

#### Task 4.2: Firebase 타입 개선 (1시간) ✅
- [x] `src/types/firebase.ts` 생성
  - [x] `DeckDocument`, `CardDocument`, `UserDocument` 타입 정의
  - [x] `FirestoreTimestamp` 타입 별칭 정의
  - [x] `convertFirestoreDate()` 헬퍼 - Timestamp ↔ Date 변환
  - [x] `convertDeckDocument()` 변환 함수 - DeckDocument → Deck
  - [x] `convertCardDocument()` 변환 함수 - CardDocument → Card
  - [x] `convertUserDocument()` 변환 함수 - UserDocument → User
  - [x] `convertDocumentData()` 범용 변환 함수 - 모든 Timestamp 자동 변환
  - [x] JSDoc 문서화

- [x] 서비스 레이어에서 타입 변환 함수 적용
  - [x] `deckService.ts` - getDeck, subscribeToDecksByUser에서 convertDocumentData 사용
  - [x] `cardService.ts` - 모든 구독/조회 함수에서 convertDocumentData 사용
  - [x] Timestamp → Date 변환 코드 중복 제거 (각 함수에서 3줄 → 1줄로 단축)

#### Task 4.3: 성능 최적화 (1-2시간) ✅
- [x] `DeckCard.tsx`에 React.memo 적용
  - [x] 커스텀 비교 함수 구현 (모든 props 비교)
  - [x] props 변경 시에만 리렌더링되도록 최적화
  - [x] JSDoc 문서화

- [x] 부모 컴포넌트에 useCallback 적용
  - [x] `Home.tsx` 이벤트 핸들러
    - [x] handleCreateDeck, handleLogout, handleDeckClick
    - [x] getDeckCardCount, getDeckDueCount 계산 함수
  - [x] `DeckDetail.tsx` 이벤트 핸들러
    - [x] handleCreateCard, handleUpdateCard, handleDeleteCard
    - [x] openEditModal, closeModal

- [x] Firestore 쿼리 최적화 (이미 Phase 1에서 완료됨)
  - [x] `cardService.getStudyCards()` - 복습 우선 + limit 적용
  - [x] 2단계 쿼리: 복습 필요 카드 우선, 부족 시 추가 조회
  - [x] 불필요한 전체 조회 제거

**📊 성과:**
- DeckCard 컴포넌트 불필요한 리렌더링 방지 (React.memo + 커스텀 비교 함수)
- Home.tsx 5개 핸들러 메모이제이션 (handleCreateDeck, handleLogout, handleDeckClick, getDeckCardCount, getDeckDueCount)
- DeckDetail.tsx 5개 핸들러 메모이제이션 (handleCreateCard, handleUpdateCard, handleDeleteCard, openEditModal, closeModal)
- Firestore 쿼리 이미 최적화 완료 (getStudyCards에 2단계 쿼리 + limit 적용)

---

### 🎯 Phase 5: 마무리 & 문서화

#### Task 5.1: 코드 정리 (1시간) ✅
- [x] 사용하지 않는 import 제거
- [x] console.log 제거
- [x] 주석 정리 및 JSDoc 추가
- [x] 파일명/폴더명 일관성 확인

**📊 성과:**
- 모든 파일에서 불필요한 import 제거 완료 (TypeScript 진단 에러 0개)
- console.log는 없음, console.warn/error는 에러 핸들링 및 타입 검증 용도로 유지
- JSDoc 추가:
  - `Button.tsx`, `Input.tsx`, `Modal.tsx`, `ProtectedRoute.tsx` - 재사용 컴포넌트 문서화
  - 모든 서비스 함수 이미 JSDoc 완료 (Phase 1-4에서 작업)
  - 모든 커스텀 훅 이미 JSDoc 완료 (Phase 2에서 작업)
- 폴더 구조 일관성 검증 완료:
  - `src/components/` (common, deck, study 서브폴더)
  - `src/config/`, `src/contexts/`, `src/hooks/`, `src/pages/`, `src/services/`, `src/types/`, `src/utils/`
  - 모든 컴포넌트 파일 PascalCase, 모든 훅 파일 camelCase

#### Task 5.2: 테스트 & 검증 (1시간)
- [ ] 모든 페이지 동작 테스트
  - [ ] 로그인/회원가입
  - [ ] 덱 생성/수정/삭제
  - [ ] 카드 추가/수정/삭제
  - [ ] 학습 모드 (키보드 단축키 포함)
  - [ ] Toast 알림 확인
  - [ ] 카드 카운트 정확성 확인

- [ ] 에러 케이스 테스트
  - [ ] 네트워크 오류
  - [ ] 잘못된 입력
  - [ ] 권한 오류

#### Task 5.3: 문서 업데이트 (30분)
- [ ] README.md 업데이트
  - [ ] 새로운 폴더 구조 반영
  - [ ] 주요 개선 사항 기록

- [ ] IMPROVEMENTS.md 체크리스트 업데이트
  - [ ] 완료된 항목 체크
  - [ ] 성과 정리

---

## 📊 예상 작업 시간 요약

| Phase | 내용 | 예상 시간 |
|-------|------|----------|
| Phase 1 | 기반 구조 구축 | 5-7시간 |
| Phase 2 | Custom Hooks | 3-5시간 |
| Phase 3 | 컴포넌트 & 검증 | 2-3시간 |
| Phase 4 | 타입 & 성능 | 3-4시간 |
| Phase 5 | 마무리 | 2-3시간 |
| **합계** | | **15-22시간** |

---

## 🚀 빠른 시작 가이드

**지금 바로 시작하려면:**
1. Task 1.1부터 순서대로 진행
2. 각 Task 완료 시 체크박스 체크
3. 커밋은 Task 단위로 진행 추천
4. Phase 1 완료 후 큰 효과 체감 가능

**작업 지시 예시:**
- "Task 1.1 폴더 구조 재구성해줘"
- "Task 1.2 상수 파일 만들어줘"
- "Task 1.3 deckService부터 만들어줘"
