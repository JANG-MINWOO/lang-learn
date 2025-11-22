'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowLeft,
  FaSync,
  FaTrophy,
  FaFire,
  FaSmile,
  FaMeh,
  FaFrown,
} from 'react-icons/fa';
import type { Card } from '../../../src/types';
import { Difficulty } from '../../../src/types';
import {
  Button,
  LoadingSpinner,
  Container,
  Badge,
  StudyCard,
} from '../../../src/components/ui';
import { STUDY_CONFIG, KEYBOARD_SHORTCUTS } from '../../../src/utils/constants';
import { getStudyCards, updateCard } from '../../../src/services/cardService';
import { useToast } from '../../../src/contexts/ToastContext';
import { processError } from '../../../src/utils/errorHandler';
import { useSpacedRepetition } from '../../../src/hooks/useSpacedRepetition';
import { useKeyboardShortcuts } from '../../../src/hooks/useKeyboardShortcuts';
import { fadeIn } from '../../../src/lib/animations';

export default function Study() {
  const params = useParams();
  const deckId = params?.deckId as string;
  const router = useRouter();
  const { showToast } = useToast();
  const { calculateNextReview } = useSpacedRepetition();
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  // 카드 가져오기
  useEffect(() => {
    if (!deckId) return;

    const fetchCards = async () => {
      try {
        const studyCards = await getStudyCards(deckId, STUDY_CONFIG.MAX_CARDS_PER_SESSION);
        setCards(studyCards);
        setLoading(false);
      } catch (error) {
        const errorMessage = processError(error, 'FetchStudyCards');
        showToast(errorMessage, 'error');
        setLoading(false);
      }
    };

    fetchCards();
  }, [deckId, showToast]);

  const handleAnswer = async (difficulty: Difficulty) => {
    const currentCard = cards[currentIndex];
    const { interval, easeFactor, nextReviewDate } = calculateNextReview(
      currentCard,
      difficulty
    );

    // Firestore 업데이트
    try {
      await updateCard(currentCard.id, {
        interval,
        easeFactor,
        nextReviewDate,
        reviewCount: currentCard.reviewCount + 1,
      });
    } catch (error) {
      const errorMessage = processError(error, 'UpdateCardProgress');
      showToast(errorMessage, 'error');
    }

    // 통계 업데이트
    setStats((prev) => ({
      ...prev,
      [difficulty]: prev[difficulty as keyof typeof prev] + 1,
    }));

    // 다음 카드로 이동
    setIsFlipped(false);
    if (currentIndex + 1 >= cards.length) {
      setIsComplete(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 키보드 단축키
  useKeyboardShortcuts(
    {
      [KEYBOARD_SHORTCUTS.FLIP_CARD]: () => !isFlipped && setIsFlipped(true),
      [KEYBOARD_SHORTCUTS.AGAIN]: () => isFlipped && handleAnswer(Difficulty.AGAIN),
      [KEYBOARD_SHORTCUTS.HARD]: () => isFlipped && handleAnswer(Difficulty.HARD),
      [KEYBOARD_SHORTCUTS.GOOD]: () => isFlipped && handleAnswer(Difficulty.GOOD),
      [KEYBOARD_SHORTCUTS.EASY]: () => isFlipped && handleAnswer(Difficulty.EASY),
    },
    !isComplete
  );

  if (loading) {
    return <LoadingSpinner message="카드를 불러오는 중..." fullScreen />;
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FaTrophy className="text-5xl text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
            학습할 카드가 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            모든 카드를 학습했거나 복습할 카드가 없습니다
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push(`/deck/${deckId}`)}
          >
            <FaArrowLeft className="mr-2" />
            덱으로 돌아가기
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="max-w-lg w-full"
        >
          {/* Trophy Icon */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-32 h-32 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <FaTrophy className="text-6xl text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-3"
            >
              학습 완료!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-lg"
            >
              총 {cards.length}개의 카드를 학습했습니다
            </motion.p>
          </div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white border-2 border-primary-200 rounded-2xl p-6 mb-6 shadow-xl"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-xl p-4 text-center">
                <FaFrown className="text-3xl text-red-500 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">다시 학습</p>
                <p className="text-3xl font-bold text-red-600">{stats.again}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-xl p-4 text-center">
                <FaMeh className="text-3xl text-orange-500 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">어려움</p>
                <p className="text-3xl font-bold text-orange-600">{stats.hard}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-4 text-center">
                <FaSmile className="text-3xl text-blue-500 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">쉬움</p>
                <p className="text-3xl font-bold text-blue-600">{stats.good}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-4 text-center">
                <FaFire className="text-3xl text-green-500 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">암기 완료</p>
                <p className="text-3xl font-bold text-green-600">{stats.easy}</p>
              </div>
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => router.push(`/deck/${deckId}`)}
            >
              <FaArrowLeft className="mr-2" />
              덱으로 돌아가기
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const frontText = isReversed ? currentCard.back : currentCard.front;
  const backText = isReversed ? currentCard.front : currentCard.back;
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-white">
      {/* Header */}
      <header className="bg-white border-b border-primary-100 shadow-sm fixed top-0 left-0 right-0 z-40">
        <Container size="lg">
          <div className="py-3 sm:py-4">
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/deck/${deckId}`)}
              >
                <FaArrowLeft className="mr-1" />
                나가기
              </Button>

              <div className="flex items-center gap-3">
                <Badge variant="primary" size="sm">
                  {currentIndex + 1} / {cards.length}
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReversed(!isReversed)}
                >
                  <FaSync className="mr-1" />
                  <span className="hidden sm:inline">
                    {isReversed ? '뒷면→앞면' : '앞면→뒷면'}
                  </span>
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-8 sm:pt-36 sm:pb-12">
        <Container size="lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <StudyCard
                frontText={frontText}
                backText={backText}
                memo={currentCard.memo}
                isFlipped={isFlipped}
                isReversed={isReversed}
                onFlip={() => setIsFlipped(!isFlipped)}
              />
            </motion.div>
          </AnimatePresence>

          {/* Answer Buttons */}
          <AnimatePresence>
            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto"
              >
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleAnswer(Difficulty.AGAIN)}
                  className="border-2 border-red-400 text-red-600 hover:bg-red-50 hover:border-red-500"
                >
                  <div className="text-center w-full">
                    <div className="font-bold text-sm sm:text-base">다시</div>
                    <div className="text-xs text-gray-500">(1)</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleAnswer(Difficulty.HARD)}
                  className="border-2 border-orange-400 text-orange-600 hover:bg-orange-50 hover:border-orange-500"
                >
                  <div className="text-center w-full">
                    <div className="font-bold text-sm sm:text-base">어려움</div>
                    <div className="text-xs text-gray-500">(2)</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleAnswer(Difficulty.GOOD)}
                  className="border-2 border-blue-400 text-blue-600 hover:bg-blue-50 hover:border-blue-500"
                >
                  <div className="text-center w-full">
                    <div className="font-bold text-sm sm:text-base">쉬움</div>
                    <div className="text-xs text-gray-500">(3)</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleAnswer(Difficulty.EASY)}
                  className="border-2 border-green-400 text-green-600 hover:bg-green-50 hover:border-green-500"
                >
                  <div className="text-center w-full">
                    <div className="font-bold text-sm sm:text-base">완료</div>
                    <div className="text-xs text-gray-500">(4)</div>
                  </div>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Keyboard Shortcuts Hint */}
          {!isFlipped && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-gray-500 text-sm mt-8"
            >
              키보드 단축키: 스페이스(답 확인), 1-4(난이도 선택)
            </motion.p>
          )}
        </Container>
      </main>
    </div>
  );
}
