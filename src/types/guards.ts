import type { User, Deck, Card } from './index';

/**
 * Deck 타입 검증
 */
export function isValidDeck(data: any): data is Deck {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.userId === 'string' &&
    typeof data.name === 'string' &&
    data.createdAt instanceof Date &&
    data.updatedAt instanceof Date
  );
}

/**
 * Card 타입 검증
 */
export function isValidCard(data: any): data is Card {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.deckId === 'string' &&
    typeof data.front === 'string' &&
    typeof data.back === 'string' &&
    typeof data.interval === 'number' &&
    data.nextReviewDate instanceof Date
  );
}

/**
 * User 타입 검증
 */
export function isValidUser(data: any): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.uid === 'string' &&
    typeof data.email === 'string' &&
    typeof data.nickname === 'string'
  );
}
