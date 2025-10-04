import { useState, useEffect } from 'react';
import { subscribeToCardsByDeck } from '../services/cardService';
import type { Card } from '../types';

/**
 * 특정 덱의 카드 목록을 실시간으로 구독하는 커스텀 훅
 * @param deckId - 덱 ID
 * @returns 카드 목록, 로딩 상태, 에러 정보
 */
export function useCards(deckId: string | undefined) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!deckId) {
      setLoading(false);
      setCards([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToCardsByDeck(deckId, (cardData) => {
        setCards(cardData);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load cards'));
      setLoading(false);
    }
  }, [deckId]);

  return { cards, loading, error };
}
