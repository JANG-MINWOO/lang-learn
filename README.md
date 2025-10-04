# Language Learning App

Speak + Anki 스타일의 언어 학습 웹 애플리케이션

## 기술 스택

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS v4
- **Routing**: React Router v7
- **Backend**: Firebase (Firestore)
- **Deployment**: Vercel / Firebase Hosting

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Firestore Database 활성화 (테스트 모드로 시작)
3. 프로젝트 설정에서 웹 앱 추가
4. Firebase 구성 정보를 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

5. `.env` 파일에 Firebase 구성 정보 입력

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 프로젝트 구조

```
src/
├── config/          # Firebase 설정
├── types/           # TypeScript 타입 정의
├── components/      # 재사용 가능한 컴포넌트
├── pages/           # 페이지 컴포넌트
├── hooks/           # 커스텀 React 훅
├── App.tsx          # 메인 앱 컴포넌트
└── main.tsx         # 진입점
```

## 주요 기능

- ✅ 덱(Deck) 관리
- ✅ 카드 CRUD
- ✅ 간격 반복 학습 알고리즘
- ✅ 학습 세션 (10개 카드 제한)
- ✅ 학습 중 메모 수정

## 빌드

```bash
npm run build
```

## 배포

### Vercel

```bash
npm install -g vercel
vercel
```

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 라이선스

MIT
