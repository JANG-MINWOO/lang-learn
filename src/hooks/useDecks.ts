import { useState, useEffect } from 'react';
import { subscribeToDecksByUser } from '../services/deckService';
import type { Deck } from '../types';

/**
 * 사용자의 덱 목록을 실시간으로 구독하는 커스텀 훅
 * @param userId - 사용자 ID
 * @returns 덱 목록, 로딩 상태, 에러 정보
 */
export function useDecks(userId: string | undefined) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setDecks([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToDecksByUser(userId, (deckData) => {
        setDecks(deckData);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load decks'));
      setLoading(false);
    }
  }, [userId]);

  return { decks, loading, error };
}
