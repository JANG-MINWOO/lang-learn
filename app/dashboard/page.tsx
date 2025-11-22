'use client';

import { useState, useEffect, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../../src/config/firebase';
import { useAuth } from '../../src/contexts/AuthContext';
import type { Card } from '../../src/types';
import Button from '../../src/components/Button';
import DeckCard from '../../src/components/deck/DeckCard';
import Modal from '../../src/components/Modal';
import Input from '../../src/components/Input';
import Textarea from '../../src/components/common/Textarea';
import { createDeck } from '../../src/services/deckService';
import { subscribeToCardsByDecks } from '../../src/services/cardService';
import { useToast } from '../../src/contexts/ToastContext';
import { processError } from '../../src/utils/errorHandler';
import { useDecks } from '../../src/hooks/useDecks';
import { useForm } from '../../src/hooks/useForm';
import * as validators from '../../src/utils/validators';

export default function Home() {
  const router = useRouter();
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { decks } = useDecks(currentUser?.uid);
  const [cards, setCards] = useState<Card[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, validate, reset } = useForm(
    { name: '', description: '' },
    {
      name: (value) => validators.required(value, '덱 이름'),
    }
  );

  // 인증 확인
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  // Firestore에서 모든 카드 실시간 구독 (덱별 카운트 계산용)
  useEffect(() => {
    if (!currentUser) return;

    // 사용자의 모든 덱 ID를 가져와서 카드 구독
    const deckIds = decks.map(deck => deck.id);
    const unsubscribe = subscribeToCardsByDecks(deckIds, setCards);
    return () => unsubscribe();
  }, [currentUser, decks]);

  // 덱별 카드 수 계산 (useCallback으로 메모이제이션)
  const getDeckCardCount = useCallback((deckId: string) => {
    return cards.filter(card => card.deckId === deckId).length;
  }, [cards]);

  // 덱별 복습 대기 카드 수 계산 (useCallback으로 메모이제이션)
  const getDeckDueCount = useCallback((deckId: string) => {
    const today = new Date();
    return cards.filter(
      card => card.deckId === deckId && card.nextReviewDate <= today
    ).length;
  }, [cards]);

  // 전체 통계
  const totalCards = cards.length;
  const totalDueCards = cards.filter(card => card.nextReviewDate <= new Date()).length;

  // 덱 생성 핸들러 (useCallback으로 메모이제이션)
  const handleCreateDeck = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !currentUser) return;

    setLoading(true);
    try {
      await createDeck(currentUser.uid, {
        name: values.name,
        description: values.description,
      });

      reset();
      setIsModalOpen(false);
      showToast('덱이 생성되었습니다', 'success');
    } catch (error) {
      const errorMessage = processError(error, 'CreateDeck');
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [validate, currentUser, values.name, values.description, reset, showToast]);

  // 로그아웃 핸들러 (useCallback으로 메모이제이션)
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      const errorMessage = processError(error, 'Logout');
      showToast(errorMessage, 'error');
    }
  }, [router, showToast]);

  // 덱 클릭 핸들러 (useCallback으로 메모이제이션)
  const handleDeckClick = useCallback((deckId: string) => {
    router.push(`/deck/${deckId}`);
  }, [router]);

  // 로딩 중
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-xl sm:text-3xl font-bold text-black mb-1">Language Learning</h1>
              <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
                {userProfile?.nickname}님, 간격 반복 학습으로 언어를 마스터하세요
              </p>
              <p className="text-gray-600 text-xs sm:hidden">
                {userProfile?.nickname}님
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                <span>덱: {decks.length}</span>
                <span>•</span>
                <span>카드: {totalCards}</span>
                {totalDueCards > 0 && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-black">복습: {totalDueCards}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button variant="accent" size="sm" className="sm:hidden flex-1 text-xs py-2" onClick={() => setIsModalOpen(true)}>
                + 덱
              </Button>
              <Button variant="accent" size="lg" className="hidden sm:inline-flex" onClick={() => setIsModalOpen(true)}>
                ✨ 새 덱 만들기
              </Button>
              <Button variant="ghost" size="sm" className="sm:hidden flex-1 text-xs py-2" onClick={handleLogout}>
                로그아웃
              </Button>
              <Button variant="ghost" size="lg" className="hidden sm:inline-flex" onClick={handleLogout}>
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Deck List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-6">내 덱</h2>

          {decks.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
              <p className="text-gray-500 text-lg mb-4">아직 덱이 없습니다</p>
              <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                + 첫 번째 덱 만들기
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  name={deck.name}
                  description={deck.description}
                  cardCount={getDeckCardCount(deck.id)}
                  dueCount={getDeckDueCount(deck.id)}
                  onClick={() => handleDeckClick(deck.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Deck Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="새 덱 만들기"
      >
        <form onSubmit={handleCreateDeck} className="space-y-4">
          <Input
            label="덱 이름"
            placeholder="예: 일상 영어 회화"
            value={values.name}
            onChange={handleChange('name')}
            error={errors.name}
            required
          />

          <Textarea
            label="설명 (선택)"
            rows={3}
            placeholder="덱에 대한 간단한 설명을 입력하세요"
            value={values.description}
            onChange={handleChange('description')}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading || !values.name.trim()}
            >
              {loading ? '생성 중...' : '만들기'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
