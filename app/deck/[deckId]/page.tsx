'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Deck, Card } from '../../../src/types';
import Button from '../../../src/components/Button';
import Modal from '../../../src/components/Modal';
import Input from '../../../src/components/Input';
import Textarea from '../../../src/components/common/Textarea';
import LoadingSpinner from '../../../src/components/common/LoadingSpinner';
import { getDeck } from '../../../src/services/deckService';
import { createCard, updateCard, deleteCard } from '../../../src/services/cardService';
import { useToast } from '../../../src/contexts/ToastContext';
import { processError } from '../../../src/utils/errorHandler';
import { useCards } from '../../../src/hooks/useCards';
import { useForm } from '../../../src/hooks/useForm';
import * as validators from '../../../src/utils/validators';

export default function DeckDetail() {
  const params = useParams();
  const deckId = params?.deckId as string;
  const router = useRouter();
  const { showToast } = useToast();
  const { cards } = useCards(deckId);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, validate, reset, setValues } = useForm(
    { front: '', back: '', memo: '' },
    {
      front: (value) => validators.required(value, '앞면'),
      back: (value) => validators.required(value, '뒷면'),
    }
  );

  // 덱 정보 가져오기
  useEffect(() => {
    if (!deckId) return;

    const fetchDeck = async () => {
      const deckData = await getDeck(deckId);
      if (deckData) {
        setDeck(deckData);
      }
    };

    fetchDeck();
  }, [deckId]);

  // 카드 생성 핸들러 (useCallback으로 메모이제이션)
  const handleCreateCard = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !deckId) return;

    setLoading(true);
    try {
      await createCard(deckId, {
        front: values.front,
        back: values.back,
        memo: values.memo,
      });

      reset();
      setIsModalOpen(false);
      showToast('카드가 추가되었습니다', 'success');
    } catch (error) {
      const errorMessage = processError(error, 'CreateCard');
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [validate, deckId, values.front, values.back, values.memo, reset, showToast]);

  // 카드 수정 핸들러 (useCallback으로 메모이제이션)
  const handleUpdateCard = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCard || !validate()) return;

    setLoading(true);
    try {
      await updateCard(editingCard.id, {
        front: values.front,
        back: values.back,
        memo: values.memo,
      });

      reset();
      setEditingCard(null);
      setIsModalOpen(false);
      showToast('카드가 수정되었습니다', 'success');
    } catch (error) {
      const errorMessage = processError(error, 'UpdateCard');
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [editingCard, validate, values.front, values.back, values.memo, reset, showToast]);

  // 카드 삭제 핸들러 (useCallback으로 메모이제이션)
  const handleDeleteCard = useCallback(async (cardId: string) => {
    if (!confirm('정말 이 카드를 삭제하시겠습니까?')) return;

    try {
      await deleteCard(cardId);
      showToast('카드가 삭제되었습니다', 'success');
    } catch (error) {
      const errorMessage = processError(error, 'DeleteCard');
      showToast(errorMessage, 'error');
    }
  }, [showToast]);

  // 수정 모달 열기 핸들러 (useCallback으로 메모이제이션)
  const openEditModal = useCallback((card: Card) => {
    setEditingCard(card);
    setValues({
      front: card.front,
      back: card.back,
      memo: card.memo,
    });
    setIsModalOpen(true);
  }, [setValues]);

  // 모달 닫기 핸들러 (useCallback으로 메모이제이션)
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCard(null);
    reset();
  }, [reset]);

  if (!deck) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
          <Button variant="ghost" size="sm" className="mb-3 sm:mb-4 text-xs sm:text-base py-1 sm:py-2" onClick={() => router.push('/')}>
            ← 뒤로 가기
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-xl sm:text-3xl font-bold text-black mb-1">{deck.name}</h1>
              {deck.description && (
                <p className="text-gray-600 text-xs sm:text-sm">{deck.description}</p>
              )}
            </div>

            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="accent"
                size="sm"
                className="flex-1 sm:flex-none text-xs sm:text-base py-2"
                onClick={() => router.push(`/study/${deckId}`)}
                disabled={cards.length === 0}
              >
                🚀 학습 시작
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-base py-2" onClick={() => setIsModalOpen(true)}>
                + 카드
              </Button>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 flex gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm">
              <span className="text-gray-600 text-xs sm:text-sm">카드: </span>
              <span className="font-bold text-black text-sm sm:text-base">{cards.length}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
        {cards.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-500 text-base sm:text-lg mb-3 sm:mb-4">아직 카드가 없습니다</p>
            <Button variant="outline" size="sm" className="text-xs sm:text-base" onClick={() => setIsModalOpen(true)}>
              + 첫 번째 카드 추가
            </Button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:border-black hover:shadow-lg transition-all duration-200 shadow-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">앞면 (공부할 내용)</p>
                    <p className="text-base sm:text-lg font-bold text-black">{card.front}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">뒷면 (뜻)</p>
                    <p className="text-sm sm:text-base text-gray-700">{card.back}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">메모</p>
                    <p className="text-xs sm:text-sm text-gray-600">{card.memo || '메모 없음'}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm" onClick={() => openEditModal(card)}>
                    수정
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 text-xs sm:text-sm"
                    onClick={() => handleDeleteCard(card.id)}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Card Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCard ? '카드 수정' : '새 카드 추가'}
      >
        <form onSubmit={editingCard ? handleUpdateCard : handleCreateCard} className="space-y-4">
          <Input
            label="앞면 (공부할 단어/문장)"
            placeholder="예: Hello"
            value={values.front}
            onChange={handleChange('front')}
            error={errors.front}
            required
          />

          <Input
            label="뒷면 (뜻)"
            placeholder="예: 안녕하세요"
            value={values.back}
            onChange={handleChange('back')}
            error={errors.back}
            required
          />

          <Textarea
            label="메모 (선택)"
            rows={3}
            placeholder="문법, 발음, 예문 등을 입력하세요"
            value={values.memo}
            onChange={handleChange('memo')}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" className="flex-1" onClick={closeModal}>
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading || !values.front.trim() || !values.back.trim()}
            >
              {loading ? '처리 중...' : editingCard ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
