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

/**
 * 덱 조회
 */
export async function getDeck(deckId: string): Promise<Deck | null> {
  const deckDoc = await getDoc(doc(db, COLLECTIONS.DECKS, deckId));

  if (!deckDoc.exists()) {
    return null;
  }

  return {
    id: deckDoc.id,
    ...deckDoc.data(),
    createdAt: deckDoc.data().createdAt?.toDate(),
    updatedAt: deckDoc.data().updatedAt?.toDate(),
  } as Deck;
}

/**
 * 덱 생성
 */
export async function createDeck(
  userId: string,
  data: { name: string; description?: string }
) {
  return addDoc(collection(db, COLLECTIONS.DECKS), {
    userId,
    name: data.name,
    description: data.description || '',
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
    const decks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Deck[];

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
