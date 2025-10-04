import { Timestamp } from 'firebase/firestore';
import type { Deck, Card, User } from './index';

export type FirestoreTimestamp = Timestamp | Date;

/**
 * Firestore 문서 타입 (서버에서 받는 형태)
 */
export interface DeckDocument {
  userId: string;
  name: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CardDocument {
  deckId: string;
  front: string;
  back: string;
  memo: string;
  interval: number;
  nextReviewDate: Timestamp;
  easeFactor: number;
  reviewCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserDocument {
  uid: string;
  email: string;
  nickname: string;
  phoneNumber: string;
  createdAt: Timestamp;
}

/**
 * Firestore Timestamp를 Date로 변환
 */
export function convertFirestoreDate(
  timestamp: Timestamp | Date | undefined
): Date | undefined {
  if (!timestamp) return undefined;
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

/**
 * Firestore DeckDocument를 앱 Deck 타입으로 변환
 */
export function convertDeckDocument(id: string, doc: DeckDocument): Deck {
  return {
    id,
    userId: doc.userId,
    name: doc.name,
    description: doc.description,
    createdAt: convertFirestoreDate(doc.createdAt)!,
    updatedAt: convertFirestoreDate(doc.updatedAt)!,
  };
}

/**
 * Firestore CardDocument를 앱 Card 타입으로 변환
 */
export function convertCardDocument(id: string, doc: CardDocument): Card {
  return {
    id,
    deckId: doc.deckId,
    front: doc.front,
    back: doc.back,
    memo: doc.memo,
    interval: doc.interval,
    nextReviewDate: convertFirestoreDate(doc.nextReviewDate)!,
    easeFactor: doc.easeFactor,
    reviewCount: doc.reviewCount,
    createdAt: convertFirestoreDate(doc.createdAt)!,
    updatedAt: convertFirestoreDate(doc.updatedAt)!,
  };
}

/**
 * Firestore UserDocument를 앱 User 타입으로 변환
 */
export function convertUserDocument(doc: UserDocument): User {
  return {
    uid: doc.uid,
    email: doc.email,
    nickname: doc.nickname,
    phoneNumber: doc.phoneNumber,
    createdAt: convertFirestoreDate(doc.createdAt)!,
  };
}
