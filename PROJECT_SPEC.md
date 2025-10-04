# 언어 학습 웹앱 기획서

## 프로젝트 개요

Speak의 회화 학습 방식과 Anki의 간격 반복 학습을 결합한 개인용 언어 학습 웹 애플리케이션

**목표 사용자**: 개인 및 소규모 지인 그룹
**핵심 가치**: 단순하고 효과적인 카드 기반 언어 학습

---

## 주요 기능

### 1. 덱(Deck) 관리
- 사용자가 학습 주제별로 덱을 생성할 수 있음
- 덱 목록 조회, 생성, 수정, 삭제 기능
- 예시: "일상 회화", "비즈니스 영어", "JLPT N2 단어" 등

### 2. 카드 관리
각 카드는 다음 3가지 정보로 구성:
- **공부할 단어/문장**: 학습 대상 (앞면)
- **그 단어/문장의 뜻**: 정답 (뒷면)
- **메모 사항**: 문법, 발음, 예문 등 추가 정보

**기능**:
- 덱에 카드 추가
- 카드 수정 및 삭제
- 학습 중 메모 실시간 수정

### 3. 학습 모드
**학습 플로우**:
1. 덱 선택 → "학습 시작" 버튼 클릭
2. 카드 앞면(공부할 단어/문장)만 표시
3. 사용자가 답을 떠올린 후 "확인" 버튼 클릭
4. 카드 뒷면(뜻 + 메모)이 표시됨
5. 학습 난이도 선택:
   - **다시 학습**: 이번 세션에서 다시 표시
   - **어려움**: 짧은 간격으로 재출제
   - **쉬움**: 중간 간격으로 재출제
   - **암기 완료**: 긴 간격으로 재출제
6. 10개 카드 완료 시 학습 세션 종료

**학습 세션 제한**:
- 한 세션당 최대 10개 카드만 제시
- 짧은 시간에 집중 학습 가능

### 4. 간격 반복 알고리즘
**기본 로직**:
- 각 카드는 복습 간격(interval)과 다음 복습 날짜(next_review_date)를 가짐
- 사용자 응답에 따라 간격 조정:
  - **다시 학습**: interval = 0 (즉시 재출제)
  - **어려움**: interval = max(1일, 현재 interval × 1.2)
  - **쉬움**: interval = max(3일, 현재 interval × 2.5)
  - **암기 완료**: interval = max(7일, 현재 interval × 4)

**카드 선택 우선순위**:
1. next_review_date가 오늘 이전인 카드
2. 한 번도 학습하지 않은 신규 카드
3. 우선순위 내에서 랜덤 선택

---

## 화면 구성

### 1. 홈 화면
- 덱 목록 표시 (카드 개수, 복습 필요 카드 개수 표시)
- 새 덱 만들기 버튼

### 2. 덱 상세 화면
- 카드 목록 표시
- 새 카드 추가 버튼
- 학습 시작 버튼
- 카드 편집/삭제 기능

### 3. 카드 추가/편집 화면
- 공부할 단어/문장 입력란
- 뜻 입력란
- 메모 입력란
- 저장/취소 버튼

### 4. 학습 화면
- 카드 앞면 표시 영역
- 확인 버튼
- 뒷면 표시 후:
  - 뜻 및 메모 표시
  - 메모 수정 버튼
  - 4가지 난이도 선택 버튼
- 진행률 표시 (예: 3/10)

### 5. 학습 완료 화면
- 학습한 카드 개수
- 각 난이도별 선택 통계
- 덱으로 돌아가기 버튼

---

## 데이터 모델

### Deck (덱)
```
{
  id: string
  name: string
  description: string (optional)
  created_at: timestamp
  updated_at: timestamp
}
```

### Card (카드)
```
{
  id: string
  deck_id: string
  front: string (공부할 단어/문장)
  back: string (뜻)
  memo: string (메모)
  interval: number (복습 간격, 일 단위)
  next_review_date: date (다음 복습 날짜)
  ease_factor: number (학습 난이도 계수, 기본 2.5)
  review_count: number (복습 횟수)
  created_at: timestamp
  updated_at: timestamp
}
```

### StudySession (학습 세션 - 선택적)
```
{
  id: string
  deck_id: string
  studied_cards: number
  duration: number (초 단위)
  completed_at: timestamp
}
```

---

## 기술 스택

### 프론트엔드
- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **UI**: TailwindCSS
- **상태 관리**: React Context API (또는 없이 시작)
- **라우팅**: React Router

### 백엔드
**Option 1: Firebase (추천)**
- Firestore Database (NoSQL)
- Firebase Authentication (익명 로그인 또는 이메일)
- Firebase Hosting
- **장점**: 완전 무료 (소규모), 설정 간단, 실시간 동기화

**Option 2: Supabase**
- PostgreSQL Database
- Supabase Auth
- **장점**: SQL 기반, 무료 티어 제공

### 배포
- **프론트엔드**: Vercel 또는 Netlify (무료)
- **백엔드**: Firebase/Supabase 자체 호스팅

### 최소 필수 라이브러리
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "firebase": "^10.x" // 또는 "@supabase/supabase-js"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "typescript": "^5.x",
    "vite": "^5.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x"
  }
}
```

---

## 개발 우선순위

### Phase 1 (MVP)
1. 덱 CRUD
2. 카드 CRUD
3. 기본 학습 모드 (10개 카드 제한)
4. 간단한 간격 반복 알고리즘

### Phase 2 (향후 확장 가능)
- 통계 대시보드
- 카드 가져오기/내보내기 (CSV)
- 음성 인식 기능 (Speak 스타일)
- 다크 모드
- 이미지 첨부

---

## 무료 호스팅 예상 비용

### Firebase 무료 티어 제한
- Firestore: 문서 읽기 50,000/일, 쓰기 20,000/일
- Hosting: 10GB 저장, 360MB/일 전송
- **→ 개인 + 지인 사용 충분**

### Vercel 무료 티어
- 100GB 대역폭/월
- 무제한 배포
- **→ 소규모 사용 충분**

---

## 참고 사항

- 초기에는 인증 없이 로컬 스토리지로 시작 가능
- 추후 Firebase Auth로 업그레이드하여 여러 기기 동기화 지원
- 간격 반복 알고리즘은 SuperMemo SM-2 알고리즘 간소화 버전 사용
