# 🔄 컴포넌트 마이그레이션 가이드

기존 컴포넌트를 새로운 파스텔 옐로우 테마 컴포넌트로 교체하는 방법

---

## 📂 컴포넌트 구조

### 기존 (Old)
```
src/components/
├── Button.tsx              ❌ 오래된 디자인
├── Input.tsx               ❌ 오래된 디자인
├── Modal.tsx               ❌ 오래된 디자인
├── common/
│   ├── LoadingSpinner.tsx  ❌ 오래된 디자인
│   └── Textarea.tsx        ❌ 오래된 디자인
└── deck/
    └── DeckCard.tsx        ❌ 오래된 디자인
```

### 새로운 (New) ✨
```
src/components/ui/
├── Button.tsx              ✅ 파스텔 옐로우 + 애니메이션
├── Input.tsx               ✅ 파스텔 옐로우 + 아이콘 지원
├── Textarea.tsx            ✅ 파스텔 옐로우
├── Modal.tsx               ✅ Framer Motion 애니메이션
├── Card.tsx                ✅ 범용 카드 컴포넌트
├── DeckCard.tsx            ✅ 새 디자인 덱 카드
├── Badge.tsx               ✅ 새로운 컴포넌트
├── LoadingSpinner.tsx      ✅ 그라디언트 스피너
├── Container.tsx           ✅ 새로운 컴포넌트
├── EmptyState.tsx          ✅ 새로운 컴포넌트
└── index.ts                ✅ 통합 export
```

---

## 🔧 마이그레이션 방법

### 1. Button 컴포넌트

#### Before (기존)
```tsx
import Button from '../src/components/Button';

<Button variant="primary" size="md">
  클릭
</Button>
```

#### After (새로운) ✨
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  클릭
</Button>

// 또는 로딩 상태 추가
<Button variant="primary" isLoading={isSubmitting}>
  저장
</Button>
```

**주요 변경사항:**
- ✅ 파스텔 옐로우 그라디언트 배경
- ✅ Framer Motion 애니메이션 (호버, 클릭)
- ✅ `isLoading` prop 추가
- ✅ `fullWidth` prop 추가
- ✅ `danger` variant 추가

---

### 2. Input/Textarea 컴포넌트

#### Before (기존)
```tsx
import Input from '../src/components/Input';
import Textarea from '../src/components/common/Textarea';

<Input label="이름" error={errors.name} />
<Textarea label="설명" rows={3} />
```

#### After (새로운) ✨
```tsx
import { Input, Textarea } from '@/components/ui';
import { FaUser, FaEnvelope } from 'react-icons/fa';

<Input
  label="이름"
  error={errors.name}
  leftIcon={<FaUser />}
  helperText="도움말 텍스트"
/>

<Textarea
  label="설명"
  rows={3}
  helperText="최대 500자"
/>
```

**주요 변경사항:**
- ✅ 파스텔 옐로우 테두리
- ✅ 왼쪽/오른쪽 아이콘 지원 (Input)
- ✅ `helperText` prop 추가
- ✅ 더 나은 포커스 스타일

---

### 3. Modal 컴포넌트

#### Before (기존)
```tsx
import Modal from '../src/components/Modal';

<Modal isOpen={isOpen} onClose={onClose} title="제목">
  내용
</Modal>
```

#### After (새로운) ✨
```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="제목"
  size="md"
  closeOnBackdropClick={true}
>
  내용
</Modal>
```

**주요 변경사항:**
- ✅ Framer Motion 애니메이션 (페이드인, 스케일)
- ✅ ESC 키로 닫기
- ✅ body 스크롤 방지
- ✅ `size` prop 추가 (sm, md, lg, xl)
- ✅ 그라디언트 제목 텍스트

---

### 4. DeckCard 컴포넌트

#### Before (기존)
```tsx
import DeckCard from '../src/components/deck/DeckCard';

<DeckCard
  name="덱 이름"
  cardCount={50}
  dueCount={10}
  onClick={handleClick}
/>
```

#### After (새로운) ✨
```tsx
import { DeckCard } from '@/components/ui';

<DeckCard
  name="덱 이름"
  description="덱 설명"
  cardCount={50}
  dueCount={10}
  lastStudied={new Date()}
  onClick={handleClick}
/>
```

**주요 변경사항:**
- ✅ 파스텔 옐로우 그라디언트 배경 (복습 대기 시)
- ✅ 아이콘 추가 (FaBook, FaFire, FaClock)
- ✅ Framer Motion 호버 애니메이션
- ✅ `lastStudied` prop 추가
- ✅ 더 풍부한 시각적 정보

---

### 5. LoadingSpinner 컴포넌트

#### Before (기존)
```tsx
import LoadingSpinner from '../src/components/common/LoadingSpinner';

<LoadingSpinner message="로딩 중..." fullScreen />
```

#### After (새로운) ✨
```tsx
import { LoadingSpinner } from '@/components/ui';

<LoadingSpinner
  message="로딩 중..."
  fullScreen
  size="md"
/>
```

**주요 변경사항:**
- ✅ 파스텔 옐로우 스피너
- ✅ Framer Motion 회전 애니메이션
- ✅ 그라디언트 배경 (fullScreen 모드)
- ✅ `size` prop 추가

---

## 📦 새로운 컴포넌트 활용하기

### Card (범용 카드)
```tsx
import { Card } from '@/components/ui';

<Card variant="gradient" hover clickable onClick={handleClick}>
  <h3>제목</h3>
  <p>내용</p>
</Card>
```

### Badge (라벨/태그)
```tsx
import { Badge } from '@/components/ui';

<Badge variant="primary" size="sm">New</Badge>
<Badge variant="warning" dot>복습 필요</Badge>
```

### EmptyState (빈 상태)
```tsx
import { EmptyState, Button } from '@/components/ui';
import { FaBook } from 'react-icons/fa';

<EmptyState
  icon={FaBook}
  title="아직 덱이 없습니다"
  description="첫 번째 덱을 만들어보세요"
  action={<Button onClick={handleCreate}>만들기</Button>}
/>
```

### Container (반응형 컨테이너)
```tsx
import { Container } from '@/components/ui';

<Container size="xl">
  <h1>페이지 제목</h1>
</Container>
```

---

## 🎯 마이그레이션 순서 (권장)

1. **Button** ← 가장 많이 사용됨
2. **Input/Textarea** ← 폼 컴포넌트
3. **Modal** ← 모달 다이얼로그
4. **DeckCard** ← 덱 목록
5. **LoadingSpinner** ← 로딩 상태
6. 기타 컴포넌트들...

---

## 💡 일괄 교체 방법

### VS Code에서 찾기/바꾸기 (Regex 사용)

1. **Button import 교체**
```regex
찾기: import Button from ['"].*components/Button['"]
바꾸기: import { Button } from '@/components/ui'
```

2. **Input import 교체**
```regex
찾기: import Input from ['"].*components/Input['"]
바꾸기: import { Input } from '@/components/ui'
```

3. **Modal import 교체**
```regex
찾기: import Modal from ['"].*components/Modal['"]
바꾸기: import { Modal } from '@/components/ui'
```

---

## ⚠️ 주의사항

### 1. 기존 컴포넌트 제거하지 마세요!
현재는 새 컴포넌트만 작성했습니다. 기존 컴포넌트는 아직 사용 중이므로 유지하세요.

### 2. 점진적 마이그레이션
한 번에 모든 페이지를 변경하지 말고, 페이지별로 점진적으로 교체하세요.

### 3. 테스트 필수
각 페이지를 교체한 후, 기능이 정상 작동하는지 확인하세요.

---

## 🚀 다음 단계

1. `/dashboard` 페이지부터 새 컴포넌트로 교체 시작
2. `/login`, `/signup` 페이지 교체
3. `/deck/[deckId]` 페이지 교체
4. `/study/[deckId]` 페이지 교체
5. 모든 마이그레이션 완료 후 기존 컴포넌트 제거

---

Happy migrating! 🎉
