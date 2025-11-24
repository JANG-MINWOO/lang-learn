// 사용자 타입
export interface User {
  uid: string;
  email: string;
  nickname: string;
  phoneNumber: string;
  provider: 'email' | 'google'; // 로그인 제공자
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
export const Difficulty = {
  AGAIN: 'again',
  HARD: 'hard',
  GOOD: 'good',
  EASY: 'easy',
} as const;

export type Difficulty = typeof Difficulty[keyof typeof Difficulty];

// 학습 세션 (선택적)
export interface StudySession {
  id: string;
  deckId: string;
  studiedCards: number;
  duration: number; // 초 단위
  completedAt: Date;
}

// 학습 기록 타입
export interface StudyRecord {
  id: string;
  userId: string;
  deckId: string;
  deckName?: string; // 덱 이름 (선택적)
  studyDate: Date; // 학습한 날짜 (시간 제외)
  cardsStudied: number; // 학습한 카드 수
  duration: number; // 학습 시간 (초)
  stats: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
  createdAt: Date;
}

// 학습 통계 (집계용)
export interface StudyStats {
  totalDays: number; // 총 학습 일수
  currentStreak: number; // 현재 연속 학습 일수
  longestStreak: number; // 최장 연속 학습 일수
  totalCards: number; // 총 학습 카드 수
  totalDuration: number; // 총 학습 시간 (초)
  averageCardsPerDay: number; // 하루 평균 학습 카드 수
  thisMonthDays: number; // 이번 달 학습 일수
  thisMonthCards: number; // 이번 달 학습 카드 수
}
