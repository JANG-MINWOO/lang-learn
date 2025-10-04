import type { User, Deck, Card } from './index';

/**
 * 타입 가드 함수 모음
 * 런타임에서 데이터의 타입을 안전하게 검증합니다.
 */

/**
 * Deck 타입 검증
 * @param data - 검증할 데이터
 * @returns data가 유효한 Deck 타입인지 여부
 */
export function isValidDeck(data: any): data is Deck {
  if (!data || typeof data !== 'object') {
    return false;
  }

  return (
    typeof data.id === 'string' &&
    typeof data.userId === 'string' &&
    typeof data.name === 'string' &&
    (data.description === undefined || typeof data.description === 'string') &&
    data.createdAt instanceof Date &&
    data.updatedAt instanceof Date
  );
}

/**
 * Card 타입 검증
 * @param data - 검증할 데이터
 * @returns data가 유효한 Card 타입인지 여부
 */
export function isValidCard(data: any): data is Card {
  if (!data || typeof data !== 'object') {
    return false;
  }

  return (
    typeof data.id === 'string' &&
    typeof data.deckId === 'string' &&
    typeof data.front === 'string' &&
    typeof data.back === 'string' &&
    typeof data.memo === 'string' &&
    typeof data.interval === 'number' &&
    data.nextReviewDate instanceof Date &&
    typeof data.easeFactor === 'number' &&
    typeof data.reviewCount === 'number' &&
    data.createdAt instanceof Date &&
    data.updatedAt instanceof Date
  );
}

/**
 * User 타입 검증
 * @param data - 검증할 데이터
 * @returns data가 유효한 User 타입인지 여부
 */
export function isValidUser(data: any): data is User {
  if (!data || typeof data !== 'object') {
    return false;
  }

  return (
    typeof data.uid === 'string' &&
    typeof data.email === 'string' &&
    typeof data.nickname === 'string' &&
    typeof data.phoneNumber === 'string' &&
    data.createdAt instanceof Date
  );
}

/**
 * Deck 배열 검증
 * @param data - 검증할 배열
 * @returns data의 모든 요소가 유효한 Deck인지 여부
 */
export function isValidDeckArray(data: any): data is Deck[] {
  return Array.isArray(data) && data.every(isValidDeck);
}

/**
 * Card 배열 검증
 * @param data - 검증할 배열
 * @returns data의 모든 요소가 유효한 Card인지 여부
 */
export function isValidCardArray(data: any): data is Card[] {
  return Array.isArray(data) && data.every(isValidCard);
}

/**
 * 부분적인 필드 검증 (생성 시 필수 필드만 체크)
 */
export function hasRequiredDeckFields(data: any): boolean {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.userId === 'string' &&
    typeof data.name === 'string'
  );
}

export function hasRequiredCardFields(data: any): boolean {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.deckId === 'string' &&
    typeof data.front === 'string' &&
    typeof data.back === 'string'
  );
}

export function hasRequiredUserFields(data: any): boolean {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.uid === 'string' &&
    typeof data.email === 'string' &&
    typeof data.nickname === 'string'
  );
}
