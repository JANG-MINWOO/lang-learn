import { Difficulty } from '../types';

// 학습 관련 설정
export const STUDY_CONFIG = {
  MAX_CARDS_PER_SESSION: 10,
  MIN_EASE_FACTOR: 1.3,
  DEFAULT_EASE_FACTOR: 2.5,

  DIFFICULTY_ADJUSTMENTS: {
    [Difficulty.AGAIN]: { intervalMultiplier: 0, easeChange: -0.2 },
    [Difficulty.HARD]: { intervalMultiplier: 1.2, easeChange: -0.15 },
    [Difficulty.GOOD]: { intervalMultiplier: 2.5, easeChange: 0 },
    [Difficulty.EASY]: { intervalMultiplier: 4, easeChange: 0.1 },
  },

  MIN_INTERVALS: {
    [Difficulty.AGAIN]: 0,  // 즉시 재출제
    [Difficulty.HARD]: 1,   // 최소 1일
    [Difficulty.GOOD]: 3,   // 최소 3일
    [Difficulty.EASY]: 7,   // 최소 7일
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

// Firebase 에러 코드 매핑
export const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': '사용자를 찾을 수 없습니다',
  'auth/wrong-password': '비밀번호가 올바르지 않습니다',
  'auth/email-already-in-use': '이미 사용 중인 이메일입니다',
  'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다',
  'auth/weak-password': '비밀번호가 너무 약합니다 (최소 6자)',
  'auth/invalid-email': '올바른 이메일 형식이 아닙니다',
  'permission-denied': '권한이 없습니다',
  'not-found': '요청한 데이터를 찾을 수 없습니다',
};

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
  STUDY_RECORDS: 'studyRecords',
} as const;

// 난이도 버튼 레이블
export const DIFFICULTY_LABELS = {
  [Difficulty.AGAIN]: '다시 학습',
  [Difficulty.HARD]: '어려움',
  [Difficulty.GOOD]: '쉬움',
  [Difficulty.EASY]: '암기 완료',
} as const;

// 난이도 버튼 색상 (Tailwind classes)
export const DIFFICULTY_COLORS = {
  [Difficulty.AGAIN]: 'bg-red-500 hover:bg-red-600',
  [Difficulty.HARD]: 'bg-orange-500 hover:bg-orange-600',
  [Difficulty.GOOD]: 'bg-blue-500 hover:bg-blue-600',
  [Difficulty.EASY]: 'bg-green-500 hover:bg-green-600',
} as const;
