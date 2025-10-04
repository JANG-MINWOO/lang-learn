// 사용자 타입
export interface User {
  uid: string;
  email: string;
  nickname: string;
  phoneNumber: string;
  createdAt: Date;
}

// 덱 타입
export interface Deck {
  id: string;
  userId: string; // 덱 소유자
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 카드 타입
export interface Card {
  id: string;
  deckId: string;
  front: string; // 공부할 단어/문장
  back: string; // 뜻
  memo: string; // 메모
  interval: number; // 복습 간격 (일 단위)
  nextReviewDate: Date; // 다음 복습 날짜
  easeFactor: number; // 학습 난이도 계수
  reviewCount: number; // 복습 횟수
  createdAt: Date;
  updatedAt: Date;
}

// 학습 난이도
export enum Difficulty {
  AGAIN = 'again',
  HARD = 'hard',
  GOOD = 'good',
  EASY = 'easy',
}

// 학습 세션 (선택적)
export interface StudySession {
  id: string;
  deckId: string;
  studiedCards: number;
  duration: number; // 초 단위
  completedAt: Date;
}
