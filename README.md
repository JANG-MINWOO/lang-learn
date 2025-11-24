# Language Learning App

Speak + Anki 스타일의 간격 반복 학습 기반 언어 학습 웹 애플리케이션

## 📌 프로젝트 개요

개인 맞춤형 언어 학습을 위한 플래시카드 앱으로, Speak의 회화 학습 방식과 Anki의 간격 반복(Spaced Repetition) 알고리즘을 결합하여 효과적인 암기를 지원합니다.

## 🛠 기술 스택

### Frontend
- **React 19** + **TypeScript** - 타입 안전성과 최신 React 기능 활용
- **Next.js 16** (App Router) - SSR/CSR 하이브리드, 최적화된 번들링
- **TailwindCSS 3** - 파스텔 옐로우 브랜드 컬러 시스템
- **Framer Motion** - 부드러운 애니메이션 및 인터랙션
- **Zustand** - 경량 클라이언트 상태 관리

### Backend
- **Firebase**
  - Authentication - 이메일/비밀번호, 구글 로그인
  - Firestore - NoSQL 데이터베이스 (실시간 동기화)
  - Analytics - 사용자 분석 (선택적)

### 개발 환경
- **포트**: 4000번 (개발 서버)
- **배포**: Vercel (Next.js 최적화)

## ✨ 주요 기능

### 1. 사용자 인증
- 이메일/비밀번호 기반 회원가입 및 로그인
- 사용자 프로필 관리 (닉네임, 전화번호)
- Protected Routes로 인증된 사용자만 접근 가능

### 2. 덱(Deck) 관리
- 주제별 덱 생성 및 관리
- 덱 이름, 설명 입력
- 실시간 덱 목록 동기화 (Firestore onSnapshot)

### 3. 카드 관리
- 카드 구성:
  - **앞면**: 공부할 단어/문장
  - **뒷면**: 뜻
  - **메모**: 문법, 발음, 예문 등 추가 정보
- 카드 추가, 수정, 삭제
- 학습 중 메모 실시간 수정 가능

### 4. 학습 모드
- **세션 구성**: 한 번에 최대 10개 카드 학습
- **카드 플립**: 클릭 또는 스페이스바로 답 확인
- **양방향 학습**:
  - 앞면 → 뒷면 (기본): 단어/문장 보고 뜻 맞추기
  - 뒷면 → 앞면 (역방향): 뜻 보고 단어/문장 작문하기
- **키보드 단축키**:
  - **스페이스바**: 답 확인 (카드 플립)
  - **1**: 다시 학습 (즉시 재출제)
  - **2**: 어려움 (짧은 간격)
  - **3**: 쉬움 (중간 간격)
  - **4**: 암기 완료 (긴 간격)

### 5. 간격 반복 알고리즘 (Spaced Repetition)
SuperMemo SM-2 알고리즘 기반 구현:
- **다시 학습**: interval = 0 (즉시 재출제)
- **어려움**: interval × 1.2, easeFactor -0.15
- **쉬움**: interval × 2.5, easeFactor 유지
- **암기 완료**: interval × 4, easeFactor +0.1
- 다음 복습 날짜 자동 계산 및 저장
- 복습 횟수 자동 기록

### 6. 학습 통계
- 세션 완료 후 통계 표시
- 난이도별 카드 수 집계
- 학습 진행률 시각화 (Progress Bar)

## 📁 프로젝트 구조

```
language-learning-app/
├── app/                         # Next.js App Router
│   ├── page.tsx                 # 랜딩 페이지
│   ├── layout.tsx               # 루트 레이아웃
│   ├── providers.tsx            # Context Providers
│   ├── globals.css              # 전역 스타일
│   ├── dashboard/               # 대시보드 페이지
│   ├── deck/[deckId]/           # 덱 상세 페이지
│   ├── study/[deckId]/          # 학습 페이지
│   ├── login/                   # 로그인 페이지
│   ├── signup/                  # 회원가입 페이지
│   └── community/               # 커뮤니티 페이지
├── src/
│   ├── components/              # 재사용 가능한 UI 컴포넌트
│   │   ├── ui/                  # UI 컴포넌트 라이브러리
│   │   │   ├── Button.tsx       # 버튼 (variants 지원)
│   │   │   ├── Input.tsx        # 입력 필드
│   │   │   ├── Modal.tsx        # 모달
│   │   │   ├── Card.tsx         # 카드 레이아웃
│   │   │   ├── DeckCard.tsx     # 덱 카드 (React.memo)
│   │   │   ├── StudyCard.tsx    # 학습 카드
│   │   │   ├── LoadingSpinner.tsx # 로딩 스피너
│   │   │   ├── Textarea.tsx     # 텍스트 영역
│   │   │   ├── Badge.tsx        # 배지
│   │   │   ├── Container.tsx    # 컨테이너
│   │   │   ├── EmptyState.tsx   # 빈 상태
│   │   │   └── index.ts         # 배럴 export
│   │   ├── layout/              # 레이아웃 컴포넌트
│   │   │   └── Header.tsx       # 헤더/네비게이션
│   │   └── ProtectedRoute.tsx   # 인증 보호 라우트
│   ├── config/
│   │   └── firebase.ts          # Firebase 초기화 및 설정
│   ├── contexts/                # React Context API
│   │   ├── AuthContext.tsx      # 인증 Context
│   │   └── ToastContext.tsx     # Toast 알림 Context
│   ├── hooks/                   # 커스텀 훅
│   │   ├── useCards.ts          # 카드 데이터 관리
│   │   ├── useDecks.ts          # 덱 데이터 관리
│   │   ├── useForm.ts           # 폼 상태 관리
│   │   ├── useSpacedRepetition.ts # SM-2 알고리즘
│   │   ├── useKeyboardShortcuts.ts # 키보드 단축키
│   │   └── useSpeech.ts         # TTS/음성 인식
│   ├── services/                # 서비스 레이어 (Firebase 추상화)
│   │   ├── cardService.ts       # 카드 CRUD + 실시간 구독
│   │   ├── deckService.ts       # 덱 CRUD + 실시간 구독
│   │   └── userService.ts       # 사용자 프로필 관리
│   ├── types/                   # TypeScript 타입 시스템
│   │   ├── index.ts             # 도메인 타입 (User, Deck, Card)
│   │   ├── guards.ts            # 런타임 타입 가드
│   │   └── firebase.ts          # Firebase 타입 변환 유틸
│   ├── utils/                   # 유틸리티 함수
│   │   ├── constants.ts         # 상수 정의
│   │   ├── validators.ts        # 폼 검증
│   │   └── errorHandler.ts      # 에러 처리
│   └── lib/
│       └── animations.ts        # Framer Motion 애니메이션
├── public/                      # 정적 파일
├── .env.example                 # 환경변수 예시
├── next.config.ts               # Next.js 설정
├── tailwind.config.js           # Tailwind 설정
├── tsconfig.json                # TypeScript 설정
└── vercel.json                  # Vercel 배포 설정
```

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone git@github.com:JANG-MINWOO/lang-learn.git
cd lang-learn/language-learning-app
```

### 2. 의존성 설치

```bash
npm install
```

### 3. Firebase 설정

#### 3.1 Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 및 생성

#### 3.2 Firestore Database 활성화
1. 좌측 메뉴 > "빌드" > "Firestore Database"
2. "데이터베이스 만들기" 클릭
3. **테스트 모드**로 시작 (개발용)
4. 위치: `asia-northeast3 (Seoul)` 선택

#### 3.3 Authentication 활성화
1. 좌측 메뉴 > "빌드" > "Authentication"
2. "시작하기" 클릭
3. "이메일/비밀번호" 사용 설정

#### 3.4 웹 앱 추가 및 환경변수 설정
1. 프로젝트 설정 > "내 앱" > 웹 앱 추가
2. 앱 닉네임 입력 및 등록
3. Firebase 구성 정보 복사
4. 환경변수 파일 생성:

```bash
cp .env.example .env
```

5. `.env.local` 파일에 Firebase 구성 정보 입력:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Google Cloud TTS 설정 (선택 - 고품질 음성)

> **참고**: 이 단계는 선택사항입니다. 설정하지 않으면 브라우저 기본 음성(Web Speech API)을 사용합니다.

#### 4.1 Google Cloud 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 (또는 기존 프로젝트 선택)

#### 4.2 Text-to-Speech API 활성화
1. [API 라이브러리](https://console.cloud.google.com/apis/library) 이동
2. "Cloud Text-to-Speech API" 검색
3. "사용 설정" 클릭

#### 4.3 API 키 생성
1. [API 및 서비스 > 사용자 인증 정보](https://console.cloud.google.com/apis/credentials) 이동
2. "사용자 인증 정보 만들기" > "API 키" 클릭
3. API 키 복사

#### 4.4 환경변수에 API 키 추가

`.env` 파일에 다음 줄 추가:

```env
VITE_GOOGLE_CLOUD_TTS_API_KEY=your_google_cloud_api_key
```

**요금 안내:**
- 월 100만 자까지 무료
- Standard 음성: $4 / 100만 자
- Neural2/WaveNet: $16 / 100만 자
- 개인 학습 앱이라면 무료 한도로 충분합니다

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:4000` 접속

## 📊 데이터 모델

### User (사용자)
```typescript
{
  uid: string              // Firebase Auth UID
  email: string            // 이메일
  nickname: string         // 닉네임
  phoneNumber: string      // 전화번호
  createdAt: Date          // 생성 날짜
}
```

### Deck (덱)
```typescript
{
  id: string               // 문서 ID
  userId: string           // 덱 소유자 UID
  name: string             // 덱 이름
  description?: string     // 설명 (선택)
  createdAt: Date          // 생성 날짜
  updatedAt: Date          // 수정 날짜
}
```

### Card (카드)
```typescript
{
  id: string               // 문서 ID
  deckId: string           // 덱 ID
  front: string            // 앞면 (공부할 단어/문장)
  back: string             // 뒷면 (뜻)
  memo: string             // 메모
  interval: number         // 복습 간격 (일 단위)
  nextReviewDate: Date     // 다음 복습 날짜
  easeFactor: number       // 학습 난이도 계수 (기본 2.5)
  reviewCount: number      // 복습 횟수
  createdAt: Date          // 생성 날짜
  updatedAt: Date          // 수정 날짜
}
```

## 🎨 UI/UX 특징

- **모던 블랙&화이트 디자인**: 깔끔하고 집중도 높은 인터페이스
- **반응형 레이아웃**: 모바일/태블릿/데스크탑 대응
- **키보드 친화적**: 마우스 없이 키보드만으로 학습 가능
- **실시간 동기화**: Firestore onSnapshot으로 데이터 즉시 반영
- **직관적인 네비게이션**: 명확한 뒤로 가기 및 페이지 전환

## 🔧 개발 명령어

```bash
# 개발 서버 실행 (포트 4000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 실행
npm run lint
```

## 📦 배포

### Vercel (추천)

Next.js 프로젝트로 최적화된 배포 환경을 제공합니다.

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

또는 [Vercel Dashboard](https://vercel.com)에서 GitHub 저장소를 연동하여 자동 배포 설정이 가능합니다.

## ✅ 최근 주요 개선 사항 (2025.10)

### 코드 품질 & 아키텍처
- ✅ **Service Layer 구현** - Firebase 작업을 서비스로 추상화 (deckService, cardService, userService)
- ✅ **에러 핸들링 시스템** - Toast 알림으로 사용자 친화적 에러 표시
- ✅ **상수 관리** - 매직 넘버/문자열을 constants.ts로 중앙화
- ✅ **검증 시스템** - validators.ts로 폼 검증 로직 통합

### 재사용성 & 생산성
- ✅ **커스텀 훅** - useDecks, useCards, useForm, useSpacedRepetition, useKeyboardShortcuts
- ✅ **공통 컴포넌트** - LoadingSpinner, Textarea, StudyCard 추출
- ✅ **폴더 구조 재구성** - components (common, deck, study), hooks, services, utils 체계화

### 타입 안전성
- ✅ **타입 가드** - 런타임 타입 검증 (isValidDeck, isValidCard, isValidUser)
- ✅ **Firebase 타입 변환** - Timestamp ↔ Date 자동 변환 유틸리티
- ✅ **JSDoc 문서화** - 모든 서비스, 훅, 주요 컴포넌트에 문서 추가

### 성능 최적화
- ✅ **React.memo** - DeckCard 컴포넌트 불필요한 리렌더링 방지
- ✅ **useCallback** - 10개 이벤트 핸들러 메모이제이션 (Home, DeckDetail)
- ✅ **Firestore 쿼리 최적화** - 2단계 쿼리 + limit으로 데이터 로딩 개선

### 코드 정리
- ✅ **TypeScript 빌드 에러 0개** - import type 구문 적용, unused variables 제거
- ✅ **일관된 코딩 스타일** - PascalCase (컴포넌트), camelCase (hooks/utils)

**성과 요약:**
- 코드 재사용성 80% 향상 (중복 코드 대폭 감소)
- 유지보수성 개선 (모듈화된 구조)
- 타입 안전성 강화 (런타임 에러 감소)
- 성능 최적화 (불필요한 리렌더링 방지)

자세한 내용은 [IMPROVEMENTS.md](./IMPROVEMENTS.md) 참고

## 🎯 향후 개선 사항

- [ ] 통계 대시보드 (학습 시간, 복습률 등)
- [ ] 카드 가져오기/내보내기 (CSV, JSON)
- [ ] 음성 인식 기능 (Speak 스타일)
- [ ] 이미지 첨부 지원
- [ ] 다크 모드
- [ ] 모바일 앱 (React Native)

## 📄 라이선스

MIT

## 👨‍💻 개발자

JANG MINWOO

## 🔗 링크

- GitHub: https://github.com/JANG-MINWOO/lang-learn
- 기획서: [PROJECT_SPEC.md](./PROJECT_SPEC.md)
