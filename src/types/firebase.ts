import type { Timestamp } from 'firebase/firestore';
import type { Deck, Card, User } from './index';

/**
 * Firebase Firestore 타입 정의 및 변환 함수
 * Firestore의 Timestamp와 앱의 Date 타입 간의 변환을 처리합니다.
 */

export type FirestoreTimestamp = Timestamp | Date;

/**
 * Firestore 문서 타입 (서버에 저장되는 형태)
 * Timestamp 타입을 사용합니다.
 */

/**
 * Firestore Deck 문서 타입
 */
export interface DeckDocument {
  userId: string;
  name: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Firestore Card 문서 타입
 */
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

/**
 * Firestore User 문서 타입
 */
export interface UserDocument {
  uid: string;
  email: string;
  nickname: string;
  phoneNumber: string;
  createdAt: Timestamp;
}

/**
 * Firestore Timestamp를 Date로 변환하는 헬퍼 함수
 * @param timestamp - Firestore Timestamp 또는 Date
 * @returns Date 객체 또는 undefined
 */
export function convertFirestoreDate(
  timestamp: Timestamp | Date | undefined
): Date | undefined {
  if (!timestamp) return undefined;
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

/**
 * Firestore Deck 문서를 앱 Deck 타입으로 변환
 * @param id - 문서 ID
 * @param doc - Firestore 문서 데이터
 * @returns 앱에서 사용하는 Deck 타입
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
 * Firestore Card 문서를 앱 Card 타입으로 변환
 * @param id - 문서 ID
 * @param doc - Firestore 문서 데이터
 * @returns 앱에서 사용하는 Card 타입
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
 * Firestore User 문서를 앱 User 타입으로 변환
 * @param doc - Firestore 문서 데이터
 * @returns 앱에서 사용하는 User 타입
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

/**
 * DocumentData를 안전하게 변환하는 범용 헬퍼
 * 모든 Timestamp 필드를 자동으로 Date로 변환합니다.
 * @param id - 문서 ID
 * @param data - Firestore DocumentData
 * @returns 타임스탬프가 Date로 변환된 객체
 */
export function convertDocumentData(id: string, data: any): any {
  const converted: any = { id };

  for (const key in data) {
    const value = data[key];

    // Timestamp를 Date로 변환
    if (value && typeof value.toDate === 'function') {
      converted[key] = value.toDate();
    } else {
      converted[key] = value;
    }
  }

  return converted;
}
