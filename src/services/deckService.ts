import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';
import type { Deck } from '../types';
import { isValidDeck, hasRequiredDeckFields } from '../types/guards';
import { convertDeckDocument, convertDocumentData } from '../types/firebase';

/**
 * 덱 조회
 */
export async function getDeck(deckId: string): Promise<Deck | null> {
  const deckDoc = await getDoc(doc(db, COLLECTIONS.DECKS, deckId));

  if (!deckDoc.exists()) {
    return null;
  }

  // convertDocumentData로 Timestamp → Date 자동 변환
  const deck = convertDocumentData(deckDoc.id, deckDoc.data()) as Deck;

  // 타입 가드로 검증
  if (!isValidDeck(deck)) {
    console.warn('Invalid deck data from Firestore:', deck);
    return null;
  }

  return deck;
}

/**
 * 덱 생성
 */
export async function createDeck(
  userId: string,
  data: { name: string; description?: string }
) {
  // 필수 필드 검증
  const deckData = {
    userId,
    name: data.name,
    description: data.description || '',
  };

  if (!hasRequiredDeckFields(deckData)) {
    throw new Error('Invalid deck data: missing required fields');
  }

  return addDoc(collection(db, COLLECTIONS.DECKS), {
    ...deckData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

/**
 * 덱 수정
 */
export async function updateDeck(
  deckId: string,
  data: Partial<Pick<Deck, 'name' | 'description'>>
) {
  return updateDoc(doc(db, COLLECTIONS.DECKS, deckId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * 덱 삭제
 */
export async function deleteDeck(deckId: string) {
  return deleteDoc(doc(db, COLLECTIONS.DECKS, deckId));
}

/**
 * 사용자별 덱 구독
 */
export function subscribeToDecksByUser(
  userId: string,
  callback: (decks: Deck[]) => void
) {
  const q = query(
    collection(db, COLLECTIONS.DECKS),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const decks = snapshot.docs
      .map((doc) => convertDocumentData(doc.id, doc.data()) as Deck)
      .filter((deck): deck is Deck => {
        // 타입 가드로 검증하고 유효한 덱만 필터링
        if (!isValidDeck(deck)) {
          console.warn('Invalid deck data from Firestore:', deck);
          return false;
        }
        return true;
      });

    callback(decks);
  });
}

/**
 * 덱 서비스 객체 (선택적 사용)
 */
export const deckService = {
  getDeck,
  createDeck,
  updateDeck,
  deleteDeck,
  subscribeToDecksByUser,
};
