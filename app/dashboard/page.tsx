'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FaBook,
  FaPlus,
  FaChartLine,
  FaFire,
  FaLayerGroup
} from 'react-icons/fa';
import { useAuth } from '../../src/contexts/AuthContext';
import type { Card } from '../../src/types';
import {
  Button,
  DeckCard,
  Modal,
  Input,
  Textarea,
  LoadingSpinner,
  EmptyState,
  Container,
  Badge
} from '../../src/components/ui';
import { createDeck } from '../../src/services/deckService';
import { subscribeToCardsByDecks } from '../../src/services/cardService';
import { useToast } from '../../src/contexts/ToastContext';
import { processError } from '../../src/utils/errorHandler';
import { useDecks } from '../../src/hooks/useDecks';
import { useForm } from '../../src/hooks/useForm';
import * as validators from '../../src/utils/validators';
import { staggerContainer, staggerItem } from '../../src/lib/animations';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { decks, loading: decksLoading } = useDecks(currentUser?.uid);
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
    if (!currentUser || decksLoading) return;

    // 덱이 없으면 빈 배열로 설정
    if (decks.length === 0) {
      setCards([]);
      return;
    }

    // 사용자의 모든 덱 ID를 가져와서 카드 구독
    const deckIds = decks.map(deck => deck.id);
    const unsubscribe = subscribeToCardsByDecks(deckIds, setCards);
    return () => unsubscribe();
  }, [currentUser, decks, decksLoading]);

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

  // 덱 클릭 핸들러 (useCallback으로 메모이제이션)
  const handleDeckClick = useCallback((deckId: string) => {
    router.push(`/deck/${deckId}`);
  }, [router]);

  // 로딩 중
  if (authLoading || decksLoading) {
    return <LoadingSpinner fullScreen message="로딩 중..." />;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-white pt-16 md:pt-16">
      {/* Quick Actions Bar */}
      <div className="bg-white border-b border-primary-100 shadow-sm">
        <Container size="xl">
          <div className="py-4">
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsModalOpen(true)}
              >
                <FaPlus className="sm:mr-2" />
                <span className="hidden sm:inline">새 덱 만들기</span>
                <span className="sm:hidden">덱 추가</span>
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-primary-100 to-secondary-100 border-b border-primary-200">
        <Container size="xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="py-6 grid grid-cols-3 gap-4"
          >
            <motion.div variants={staggerItem} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl mb-2 shadow-sm">
                <FaLayerGroup className="text-xl text-primary-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{decks.length}</p>
              <p className="text-sm text-gray-600">덱</p>
            </motion.div>

            <motion.div variants={staggerItem} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl mb-2 shadow-sm">
                <FaChartLine className="text-xl text-secondary-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalCards}</p>
              <p className="text-sm text-gray-600">카드</p>
            </motion.div>

            <motion.div variants={staggerItem} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl mb-2 shadow-sm">
                <FaFire className="text-xl text-red-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalDueCards}</p>
              <p className="text-sm text-gray-600">복습 대기</p>
            </motion.div>
          </motion.div>
        </Container>
      </div>

      {/* Main Content */}
      <main className="py-8 sm:py-12">
        <Container size="xl">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                내 덱
              </h2>
              <p className="text-sm text-gray-600">
                학습할 덱을 선택하거나 새 덱을 만들어보세요
              </p>
            </div>

            {totalDueCards > 0 && (
              <Badge variant="warning" size="lg" dot>
                {totalDueCards}개 복습 필요
              </Badge>
            )}
          </div>

          {/* Deck List */}
          {decks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EmptyState
                icon={FaBook}
                title="아직 덱이 없습니다"
                description="첫 번째 덱을 만들어 학습을 시작하세요"
                action={
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <FaPlus className="mr-2" />
                    첫 번째 덱 만들기
                  </Button>
                }
              />
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {decks.map((deck) => (
                <motion.div key={deck.id} variants={staggerItem}>
                  <DeckCard
                    name={deck.name}
                    description={deck.description}
                    cardCount={getDeckCardCount(deck.id)}
                    dueCount={getDeckDueCount(deck.id)}
                    onClick={() => handleDeckClick(deck.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </Container>
      </main>

      {/* Create Deck Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        title="새 덱 만들기"
        size="md"
      >
        <form onSubmit={handleCreateDeck} className="space-y-5">
          <Input
            label="덱 이름"
            placeholder="예: 일상 영어 회화"
            value={values.name}
            onChange={handleChange('name')}
            error={errors.name}
            leftIcon={<FaBook />}
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
              size="lg"
              fullWidth
              onClick={() => {
                setIsModalOpen(false);
                reset();
              }}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              disabled={!values.name.trim()}
            >
              만들기
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
