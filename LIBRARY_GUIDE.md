# 📚 설치된 라이브러리 사용 가이드

이 프로젝트에 설치된 필수 라이브러리들과 사용법을 안내합니다.

---

## 1. 🎬 Framer Motion (애니메이션)

**역할:** React 애니메이션 라이브러리 - 부드러운 애니메이션과 페이지 전환 효과

### 기본 사용법

```tsx
import { motion } from 'framer-motion';

// 기본 페이드인 애니메이션
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  내용
</motion.div>

// 호버 애니메이션
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  버튼
</motion.button>
```

### 프리셋 사용 (src/lib/animations.ts)

```tsx
import { motion } from 'framer-motion';
import { fadeIn, slideUp, scaleIn } from '@/lib/animations';

// 페이드인
<motion.div variants={fadeIn} initial="hidden" animate="visible">
  내용
</motion.div>

// 슬라이드 업
<motion.div variants={slideUp} initial="hidden" animate="visible">
  내용
</motion.div>

// 리스트 순차 등장
<motion.ul variants={staggerContainer} initial="hidden" animate="visible">
  <motion.li variants={staggerItem}>항목 1</motion.li>
  <motion.li variants={staggerItem}>항목 2</motion.li>
  <motion.li variants={staggerItem}>항목 3</motion.li>
</motion.ul>
```

### 실전 예시: 카드 리스트

```tsx
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, cardHover } from '@/lib/animations';

export default function DeckList({ decks }) {
  return (
    <motion.div
      className="grid grid-cols-3 gap-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {decks.map((deck) => (
        <motion.div
          key={deck.id}
          variants={staggerItem}
          whileHover="hover"
          whileTap="tap"
          className="border rounded-xl p-6"
        >
          <h3>{deck.name}</h3>
        </motion.div>
      ))}
    </motion.div>
  );
}
```

---

## 2. 🎨 React Icons (아이콘)

**역할:** 수천 개의 아이콘을 한 곳에서 사용 (Font Awesome, Material Design, etc.)

### 사용법

```tsx
import { FaHome, FaUser, FaCog } from 'react-icons/fa'; // Font Awesome
import { MdEmail, MdPhone } from 'react-icons/md'; // Material Design
import { AiOutlineHeart } from 'react-icons/ai'; // Ant Design
import { BiLogOut } from 'react-icons/bi'; // BoxIcons

// 기본 사용
<FaHome />
<FaUser className="text-2xl text-blue-500" />

// Tailwind와 함께
<button className="flex items-center gap-2">
  <BiLogOut />
  로그아웃
</button>
```

### 자주 쓰는 아이콘

```tsx
// 네비게이션
import { FaHome, FaBook, FaUser, FaCog, FaSearch } from 'react-icons/fa';

// 액션
import { MdEdit, MdDelete, MdAdd, MdClose } from 'react-icons/md';

// 상태
import { AiOutlineLoading3Quarters, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';

// 소셜
import { FaGoogle, FaFacebook, FaTwitter } from 'react-icons/fa';
```

### 실전 예시

```tsx
import { FaBook, FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';

<motion.button
  whileHover={{ scale: 1.05 }}
  className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg"
>
  <FaPlus />
  새 덱 만들기
</motion.button>
```

---

## 3. 🎯 clsx + tailwind-merge (Tailwind 유틸리티)

**역할:** 조건부 클래스 관리 및 Tailwind 클래스 충돌 방지

### cn() 유틸리티 함수 (src/lib/utils.ts)

```tsx
import { cn } from '@/lib/utils';

// 기본 사용
<div className={cn('px-4 py-2', 'bg-white')}>

// 조건부 클래스
<div className={cn(
  'px-4 py-2',
  isActive && 'bg-blue-500 text-white',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>

// Tailwind 충돌 방지 (마지막 클래스가 우선)
<div className={cn('px-2', 'px-4')}> // 결과: px-4
```

### 실전 예시: 버튼 컴포넌트

```tsx
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        // 기본 스타일
        'rounded-lg font-medium transition-colors',

        // variant별 스타일
        variant === 'primary' && 'bg-black text-white hover:bg-gray-800',
        variant === 'secondary' && 'bg-gray-200 text-black hover:bg-gray-300',
        variant === 'ghost' && 'bg-transparent hover:bg-gray-100',

        // size별 스타일
        size === 'sm' && 'px-3 py-1 text-sm',
        size === 'md' && 'px-4 py-2 text-base',
        size === 'lg' && 'px-6 py-3 text-lg',

        // 외부에서 전달받은 추가 클래스
        className
      )}
      {...props}
    />
  );
}
```

---

## 4. 📅 date-fns (날짜 처리)

**역할:** 날짜 포맷팅, 계산, 비교 등 날짜 관련 모든 작업

### 기본 사용법

```tsx
import { format, formatDistance, addDays, isBefore } from 'date-fns';
import { ko } from 'date-fns/locale'; // 한국어

// 날짜 포맷팅
const date = new Date();
format(date, 'yyyy년 MM월 dd일'); // "2025년 11월 22일"
format(date, 'PPP', { locale: ko }); // "2025년 11월 22일"

// 상대 시간
formatDistance(new Date(2025, 0, 1), new Date(), { locale: ko }); // "2개월 전"

// 날짜 계산
const nextWeek = addDays(new Date(), 7);

// 날짜 비교
isBefore(new Date(2025, 0, 1), new Date()); // false
```

### 실전 예시: 복습 카드

```tsx
import { format, formatDistance, isBefore } from 'date-fns';
import { ko } from 'date-fns/locale';

export function CardItem({ card }) {
  const isOverdue = isBefore(card.nextReviewDate, new Date());
  const timeUntilReview = formatDistance(card.nextReviewDate, new Date(), {
    locale: ko,
    addSuffix: true // "~후", "~전" 추가
  });

  return (
    <div className={cn(
      'p-4 border rounded-lg',
      isOverdue && 'border-red-500 bg-red-50'
    )}>
      <h3>{card.front}</h3>
      <p className="text-sm text-gray-500">
        다음 복습: {format(card.nextReviewDate, 'MM/dd HH:mm')}
      </p>
      <p className="text-xs">
        {isOverdue ? '복습 기한 지남!' : timeUntilReview}
      </p>
    </div>
  );
}
```

---

## 5. 🗃️ Zustand (전역 상태 관리, 선택적)

**역할:** Redux보다 간단한 전역 상태 관리 (Context API 대체)

### 기본 사용법

```tsx
// stores/useUserStore.ts
import { create } from 'zustand';

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  theme: 'light',
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
}));
```

### 컴포넌트에서 사용

```tsx
import { useUserStore } from '@/stores/useUserStore';

export function Header() {
  const { user, theme, toggleTheme } = useUserStore();

  return (
    <header>
      <p>안녕하세요, {user?.nickname}님</p>
      <button onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  );
}
```

### 실전 예시: 학습 통계 관리

```tsx
// stores/useStudyStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // 로컬 스토리지 저장

interface StudyStore {
  todayCount: number;
  totalCount: number;
  addStudyCount: (count: number) => void;
  resetToday: () => void;
}

export const useStudyStore = create<StudyStore>()(
  persist(
    (set) => ({
      todayCount: 0,
      totalCount: 0,
      addStudyCount: (count) => set((state) => ({
        todayCount: state.todayCount + count,
        totalCount: state.totalCount + count,
      })),
      resetToday: () => set({ todayCount: 0 }),
    }),
    { name: 'study-stats' } // 로컬스토리지 키
  )
);
```

---

## 📖 종합 예시: 애니메이션이 적용된 덱 카드

```tsx
'use client';

import { motion } from 'framer-motion';
import { FaBook, FaFire } from 'react-icons/fa';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { cardHover } from '@/lib/animations';

interface DeckCardProps {
  name: string;
  cardCount: number;
  dueCount: number;
  lastStudied?: Date;
  onClick: () => void;
}

export function DeckCard({ name, cardCount, dueCount, lastStudied, onClick }: DeckCardProps) {
  const hasDueCards = dueCount > 0;

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className={cn(
        'p-6 border-2 rounded-xl cursor-pointer transition-colors',
        hasDueCards
          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-white'
          : 'border-gray-200 bg-white hover:border-black'
      )}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaBook className="text-xl" />
          <h3 className="text-lg font-bold">{name}</h3>
        </div>
        {hasDueCards && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
          >
            <FaFire className="text-xs" />
            {dueCount}
          </motion.div>
        )}
      </div>

      {/* 통계 */}
      <div className="flex gap-4 text-sm text-gray-600">
        <span>카드 {cardCount}개</span>
        {lastStudied && (
          <span>
            마지막 학습: {format(lastStudied, 'MM/dd', { locale: ko })}
          </span>
        )}
      </div>
    </motion.div>
  );
}
```

---

## 🚀 사용 팁

### 1. 애니메이션 성능 최적화
```tsx
// layoutId로 공유 레이아웃 애니메이션
<motion.div layoutId="card">
```

### 2. 조건부 렌더링과 애니메이션
```tsx
import { AnimatePresence } from 'framer-motion';

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      모달
    </motion.div>
  )}
</AnimatePresence>
```

### 3. 스크롤 애니메이션
```tsx
import { useScroll, useTransform } from 'framer-motion';

const { scrollY } = useScroll();
const opacity = useTransform(scrollY, [0, 300], [1, 0]);

<motion.div style={{ opacity }}>
  스크롤하면 사라지는 요소
</motion.div>
```

---

## 📦 추가로 고려할 라이브러리 (필요시)

- **react-hot-toast**: 토스트 알림 (현재 직접 구현 중)
- **react-hook-form**: 복잡한 폼 관리
- **zod**: 스키마 검증
- **next-themes**: 다크 모드
- **recharts**: 차트/그래프
- **@dnd-kit**: 드래그 앤 드롭

---

현재 설치된 라이브러리만으로도 충분히 모던하고 멋진 UI/UX를 구현할 수 있습니다!
