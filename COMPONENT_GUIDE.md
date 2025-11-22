# 🎨 UI 컴포넌트 가이드

파스텔 옐로우 테마의 재사용 가능한 UI 컴포넌트 라이브러리입니다.
모든 컴포넌트는 Framer Motion 애니메이션과 Tailwind CSS를 사용합니다.

## 📦 Import 방법

```tsx
// 개별 import
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

// 또는 한 번에 import
import { Button, Card, Input, Modal } from '@/components/ui';
```

---

## 🔘 Button

파스텔 옐로우 그라디언트가 적용된 버튼 컴포넌트

### Props

- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean
- `fullWidth`: boolean

### 사용 예시

```tsx
import { Button } from '@/components/ui';

// 기본 버튼
<Button variant="primary" size="md">
  클릭하세요
</Button>

// 로딩 상태
<Button isLoading>처리 중...</Button>

// 전체 너비
<Button fullWidth>전체 너비 버튼</Button>

// 위험 동작
<Button variant="danger" onClick={handleDelete}>
  삭제
</Button>
```

---

## 📄 Card

애니메이션이 적용된 범용 카드 컴포넌트

### Props

- `variant`: 'default' | 'gradient' | 'outline' | 'elevated'
- `hover`: boolean - 호버 애니메이션 활성화
- `clickable`: boolean - 클릭 가능 (커서 포인터)
- `padding`: 'none' | 'sm' | 'md' | 'lg'

### 사용 예시

```tsx
import { Card } from '@/components/ui';

// 기본 카드
<Card variant="default" padding="md">
  <h3>카드 제목</h3>
  <p>카드 내용</p>
</Card>

// 그라디언트 배경 + 호버 효과
<Card variant="gradient" hover clickable onClick={handleClick}>
  클릭 가능한 카드
</Card>

// 패딩 없음 (이미지 카드 등)
<Card padding="none">
  <img src="..." alt="..." />
  <div className="p-4">내용</div>
</Card>
```

---

## 📝 Input / Textarea

파스텔 테마의 입력 필드

### Props

- `label`: string - 레이블
- `error`: string - 에러 메시지
- `helperText`: string - 도움말 텍스트
- `leftIcon`: ReactNode - 왼쪽 아이콘 (Input만)
- `rightIcon`: ReactNode - 오른쪽 아이콘 (Input만)
- `resize`: boolean - 크기 조절 가능 (Textarea만)

### 사용 예시

```tsx
import { Input, Textarea } from '@/components/ui';
import { FaUser, FaEnvelope } from 'react-icons/fa';

// 기본 입력
<Input
  label="이름"
  placeholder="이름을 입력하세요"
  required
/>

// 아이콘 포함
<Input
  label="이메일"
  leftIcon={<FaEnvelope />}
  type="email"
  error={errors.email}
/>

// 텍스트 영역
<Textarea
  label="설명"
  rows={4}
  helperText="최대 500자까지 입력 가능합니다"
/>
```

---

## 🪟 Modal

애니메이션이 적용된 모달 (ESC 키, 배경 클릭 닫기 지원)

### Props

- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `showCloseButton`: boolean
- `closeOnBackdropClick`: boolean

### 사용 예시

```tsx
import { Modal, Button, Input } from '@/components/ui';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        모달 열기
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="새 덱 만들기"
        size="md"
      >
        <div className="space-y-4">
          <Input label="덱 이름" placeholder="예: 일상 영어 회화" />
          <Textarea label="설명" rows={3} />

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsOpen(false)} fullWidth>
              취소
            </Button>
            <Button variant="primary" fullWidth>
              만들기
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
```

---

## 🎴 DeckCard

덱 정보를 표시하는 전용 카드 컴포넌트

### Props

- `name`: string - 덱 이름
- `description`: string - 덱 설명
- `cardCount`: number - 전체 카드 수
- `dueCount`: number - 복습 대기 카드 수
- `lastStudied`: Date - 마지막 학습 날짜
- `onClick`: () => void

### 사용 예시

```tsx
import { DeckCard } from '@/components/ui';

<DeckCard
  name="일상 영어 회화"
  description="매일 사용하는 영어 표현 모음"
  cardCount={50}
  dueCount={10}
  lastStudied={new Date('2025-11-20')}
  onClick={() => router.push('/deck/123')}
/>
```

---

## 🏷️ Badge

작은 라벨/태그 컴포넌트

### Props

- `variant`: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `dot`: boolean - 점 표시

### 사용 예시

```tsx
import { Badge } from '@/components/ui';

<Badge variant="primary" size="sm">
  새로운
</Badge>

<Badge variant="warning" dot>
  복습 필요
</Badge>

<Badge variant="success">
  완료
</Badge>
```

---

## ⏳ LoadingSpinner

로딩 상태 표시

### Props

- `message`: string
- `fullScreen`: boolean
- `size`: 'sm' | 'md' | 'lg'

### 사용 예시

```tsx
import { LoadingSpinner } from '@/components/ui';

// 인라인
<LoadingSpinner message="데이터 불러오는 중..." size="md" />

// 전체 화면
<LoadingSpinner fullScreen message="로딩 중..." />
```

---

## 📦 Container

반응형 컨테이너

### Props

- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'

### 사용 예시

```tsx
import { Container } from '@/components/ui';

<Container size="xl">
  <h1>페이지 제목</h1>
  <p>내용...</p>
</Container>
```

---

## 🗂️ EmptyState

빈 상태 표시 (데이터 없을 때)

### Props

- `icon`: IconType (react-icons)
- `title`: string
- `description`: string
- `action`: ReactNode

### 사용 예시

```tsx
import { EmptyState, Button } from '@/components/ui';
import { FaBook } from 'react-icons/fa';

<EmptyState
  icon={FaBook}
  title="아직 덱이 없습니다"
  description="첫 번째 덱을 만들어 학습을 시작하세요"
  action={
    <Button onClick={handleCreate}>
      + 첫 번째 덱 만들기
    </Button>
  }
/>
```

---

## 🎨 Color Palette

### Primary (노란색)
- `primary-50`: #fffef0
- `primary-500`: #ffd000 ⭐ 메인 컬러
- `primary-700`: #cc9f00

### Secondary (오렌지)
- `secondary-50`: #fef8f0
- `secondary-500`: #f29100
- `secondary-700`: #c17300

### Accent
- `accent-500`: #ff8f00

---

## 💡 사용 팁

### 1. 일관된 스타일 유지
```tsx
// ✅ 좋은 예: 동일한 variant 사용
<Button variant="primary">저장</Button>
<Button variant="ghost">취소</Button>

// ❌ 나쁜 예: 스타일 혼용
<button className="custom-style">저장</button>
<Button variant="ghost">취소</Button>
```

### 2. 애니메이션 활용
```tsx
// Card에 hover 효과 추가
<Card hover clickable onClick={handleClick}>
  클릭하면 애니메이션!
</Card>
```

### 3. 로딩 상태 처리
```tsx
<Button isLoading={isSubmitting}>
  {isSubmitting ? '저장 중...' : '저장'}
</Button>
```

### 4. 에러 처리
```tsx
<Input
  label="이메일"
  error={errors.email}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

---

## 🚀 앞으로 추가할 컴포넌트

- [ ] Dropdown/Select
- [ ] Checkbox/Radio
- [ ] Switch/Toggle
- [ ] Toast/Alert
- [ ] Progress Bar
- [ ] Skeleton Loader
- [ ] Tooltip
- [ ] Tabs
- [ ] Accordion

---

Happy coding! 🎉
