import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  getDocs,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS, STUDY_CONFIG } from '../utils/constants';
import type { Card } from '../types';
import { isValidCard, hasRequiredCardFields } from '../types/guards';
import { convertCardDocument, convertDocumentData } from '../types/firebase';

/**
 * 카드 생성
 */
export async function createCard(
  deckId: string,
  data: { front: string; back: string; memo: string }
) {
  // 필수 필드 검증
  const cardData = {
    deckId,
    front: data.front,
    back: data.back,
    memo: data.memo || '',
  };

  if (!hasRequiredCardFields(cardData)) {
    throw new Error('Invalid card data: missing required fields');
  }

  return addDoc(collection(db, COLLECTIONS.CARDS), {
    ...cardData,
    interval: 0,
    nextReviewDate: Timestamp.now(),
    easeFactor: STUDY_CONFIG.DEFAULT_EASE_FACTOR,
    reviewCount: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

/**
 * 카드 수정
 */
export async function updateCard(
  cardId: string,
  data: Partial<Card>
) {
  const updateData: any = { ...data };

  // Date 객체를 Timestamp로 변환
  if (data.nextReviewDate instanceof Date) {
    updateData.nextReviewDate = Timestamp.fromDate(data.nextReviewDate);
  }

  updateData.updatedAt = Timestamp.now();

  return updateDoc(doc(db, COLLECTIONS.CARDS, cardId), updateData);
}

/**
 * 카드 삭제
 */
export async function deleteCard(cardId: string) {
  return deleteDoc(doc(db, COLLECTIONS.CARDS, cardId));
}

/**
 * 덱별 카드 구독
 */
export function subscribeToCardsByDeck(
  deckId: string,
  callback: (cards: Card[]) => void
) {
  const q = query(
    collection(db, COLLECTIONS.CARDS),
    where('deckId', '==', deckId)
  );

  return onSnapshot(q, (snapshot) => {
    const cards = snapshot.docs
      .map((doc) => convertDocumentData(doc.id, doc.data()) as Card)
      .filter((card): card is Card => {
        // 타입 가드로 검증하고 유효한 카드만 필터링
        if (!isValidCard(card)) {
          console.warn('Invalid card data from Firestore:', card);
          return false;
        }
        return true;
      });

    callback(cards);
  });
}

/**
 * 여러 덱의 카드 구독 (덱 ID 배열)
 */
export function subscribeToCardsByDecks(
  deckIds: string[],
  callback: (cards: Card[]) => void
) {
  if (deckIds.length === 0) {
    callback([]);
    return () => {}; // 빈 unsubscribe 함수 반환
  }

  const q = query(
    collection(db, COLLECTIONS.CARDS),
    where('deckId', 'in', deckIds)
  );

  return onSnapshot(q, (snapshot) => {
    const cards = snapshot.docs
      .map((doc) => convertDocumentData(doc.id, doc.data()) as Card)
      .filter((card): card is Card => {
        // 타입 가드로 검증하고 유효한 카드만 필터링
        if (!isValidCard(card)) {
          console.warn('Invalid card data from Firestore:', card);
          return false;
        }
        return true;
      });

    callback(cards);
  });
}

/**
 * 학습용 카드 조회 (최적화)
 * 복습 필요한 카드 우선, 최대 개수 제한
 */
export async function getStudyCards(
  deckId: string,
  maxCards: number = STUDY_CONFIG.MAX_CARDS_PER_SESSION
): Promise<Card[]> {
  const today = Timestamp.now();

  // 1. 복습이 필요한 카드 우선 조회
  const dueQuery = query(
    collection(db, COLLECTIONS.CARDS),
    where('deckId', '==', deckId),
    where('nextReviewDate', '<=', today),
    orderBy('nextReviewDate', 'asc'),
    limit(maxCards)
  );

  const dueSnapshot = await getDocs(dueQuery);

  // 충분한 카드가 있으면 반환
  if (dueSnapshot.size >= maxCards) {
    return dueSnapshot.docs
      .map(doc => convertDocumentData(doc.id, doc.data()) as Card)
      .filter((card): card is Card => {
        if (!isValidCard(card)) {
          console.warn('Invalid card data from Firestore:', card);
          return false;
        }
        return true;
      });
  }

  // 2. 부족하면 전체 카드에서 추가
  const remaining = maxCards - dueSnapshot.size;
  const allQuery = query(
    collection(db, COLLECTIONS.CARDS),
    where('deckId', '==', deckId),
    orderBy('createdAt', 'desc'),
    limit(remaining)
  );

  const allSnapshot = await getDocs(allQuery);

  const dueCards = dueSnapshot.docs
    .map(doc => convertDocumentData(doc.id, doc.data()) as Card)
    .filter((card): card is Card => {
      if (!isValidCard(card)) {
        console.warn('Invalid card data from Firestore:', card);
        return false;
      }
      return true;
    });

  const additionalCards = allSnapshot.docs
    .filter(doc => !dueCards.some(card => card.id === doc.id))
    .map(doc => convertDocumentData(doc.id, doc.data()) as Card)
    .filter((card): card is Card => {
      if (!isValidCard(card)) {
        console.warn('Invalid card data from Firestore:', card);
        return false;
      }
      return true;
    });

  return [...dueCards, ...additionalCards];
}

/**
 * 카드 서비스 객체 (선택적 사용)
 */
export const cardService = {
  createCard,
  updateCard,
  deleteCard,
  subscribeToCardsByDeck,
  subscribeToCardsByDecks,
  getStudyCards,
};
