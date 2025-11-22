'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FaBook,
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaPlay,
  FaLayerGroup,
} from 'react-icons/fa';
import type { Deck, Card } from '../../../src/types';
import {
  Button,
  Modal,
  Input,
  Textarea,
  LoadingSpinner,
  Container,
  EmptyState,
  Badge,
} from '../../../src/components/ui';
import { getDeck } from '../../../src/services/deckService';
import { createCard, updateCard, deleteCard } from '../../../src/services/cardService';
import { useToast } from '../../../src/contexts/ToastContext';
import { processError } from '../../../src/utils/errorHandler';
import { useCards } from '../../../src/hooks/useCards';
import { useForm } from '../../../src/hooks/useForm';
import * as validators from '../../../src/utils/validators';
import { fadeIn, staggerContainer, staggerItem } from '../../../src/lib/animations';

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

  // 카드 생성 핸들러
  const handleCreateCard = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [validate, deckId, values.front, values.back, values.memo, reset, showToast]
  );

  // 카드 수정 핸들러
  const handleUpdateCard = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [editingCard, validate, values.front, values.back, values.memo, reset, showToast]
  );

  // 카드 삭제 핸들러
  const handleDeleteCard = useCallback(
    async (cardId: string) => {
      if (!confirm('정말 이 카드를 삭제하시겠습니까?')) return;

      try {
        await deleteCard(cardId);
        showToast('카드가 삭제되었습니다', 'success');
      } catch (error) {
        const errorMessage = processError(error, 'DeleteCard');
        showToast(errorMessage, 'error');
      }
    },
    [showToast]
  );

  // 수정 모달 열기 핸들러
  const openEditModal = useCallback(
    (card: Card) => {
      setEditingCard(card);
      setValues({
        front: card.front,
        back: card.back,
        memo: card.memo,
      });
      setIsModalOpen(true);
    },
    [setValues]
  );

  // 모달 닫기 핸들러
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCard(null);
    reset();
  }, [reset]);

  if (!deck) {
    return <LoadingSpinner fullScreen message="덱 정보 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-white pt-16">
      {/* Header */}
      <header className="bg-white border-b border-primary-100 shadow-sm sticky top-16 z-40">
        <Container size="xl">
          <div className="py-4 sm:py-6">
            {/* Deck Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className="flex-1"
              >
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="p-2 rounded-lg hover:bg-primary-50 transition-colors"
                    aria-label="대시보드로 돌아가기"
                  >
                    <FaArrowLeft className="text-xl text-primary-600" />
                  </button>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    {deck.name}
                  </h1>
                </div>
                {deck.description && (
                  <p className="text-gray-600 text-sm ml-14">{deck.description}</p>
                )}
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-2 sm:gap-3"
              >
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => router.push(`/study/${deckId}`)}
                  disabled={cards.length === 0}
                >
                  <FaPlay className="mr-2" />
                  <span className="hidden sm:inline">학습 시작</span>
                  <span className="sm:hidden">학습</span>
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setIsModalOpen(true)}
                >
                  <FaPlus className="sm:mr-2" />
                  <span className="hidden sm:inline">카드 추가</span>
                </Button>
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 flex gap-3"
            >
              <Badge variant="primary" size="md">
                <FaLayerGroup className="mr-1" />
                {cards.length}개 카드
              </Badge>
            </motion.div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="py-8 sm:py-12">
        <Container size="xl">
          {cards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EmptyState
                icon={FaBook}
                title="아직 카드가 없습니다"
                description="첫 번째 카드를 만들어 학습을 시작하세요"
                action={
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <FaPlus className="mr-2" />
                    첫 번째 카드 만들기
                  </Button>
                }
              />
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {cards.map((card) => (
                <motion.div key={card.id} variants={staggerItem}>
                  <div className="bg-white border-2 border-primary-200 rounded-2xl p-4 sm:p-6 hover:border-primary-400 hover:shadow-xl transition-all duration-200 shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 앞면 */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 bg-primary-500 rounded-full" />
                          앞면 (공부할 내용)
                        </p>
                        <p className="text-lg font-bold text-gray-900">{card.front}</p>
                      </div>

                      {/* 뒷면 */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 bg-secondary-500 rounded-full" />
                          뒷면 (뜻)
                        </p>
                        <p className="text-base text-gray-700">{card.back}</p>
                      </div>

                      {/* 메모 */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 bg-accent-500 rounded-full" />
                          메모
                        </p>
                        <p className="text-sm text-gray-600">
                          {card.memo || (
                            <span className="text-gray-400 italic">메모 없음</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-primary-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(card)}
                      >
                        <FaEdit className="mr-1" />
                        수정
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        <FaTrash className="mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </Container>
      </main>

      {/* Add/Edit Card Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCard ? '카드 수정' : '새 카드 추가'}
        size="md"
      >
        <form
          onSubmit={editingCard ? handleUpdateCard : handleCreateCard}
          className="space-y-5"
        >
          <Input
            label="앞면 (공부할 단어/문장)"
            placeholder="예: Hello"
            value={values.front}
            onChange={handleChange('front')}
            error={errors.front}
            leftIcon={<FaBook />}
            required
          />

          <Input
            label="뒷면 (뜻)"
            placeholder="예: 안녕하세요"
            value={values.back}
            onChange={handleChange('back')}
            error={errors.back}
            leftIcon={<FaBook />}
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
            <Button
              type="button"
              variant="ghost"
              size="lg"
              fullWidth
              onClick={closeModal}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              disabled={!values.front.trim() || !values.back.trim()}
            >
              {editingCard ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
