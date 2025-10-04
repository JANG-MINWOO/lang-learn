import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Card } from '../types';
import { Difficulty } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StudyCard from '../components/study/StudyCard';
import { STUDY_CONFIG, KEYBOARD_SHORTCUTS } from '../utils/constants';
import { getStudyCards, updateCard } from '../services/cardService';
import { useToast } from '../contexts/ToastContext';
import { processError } from '../utils/errorHandler';
import { useSpacedRepetition } from '../hooks/useSpacedRepetition';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export default function Study() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
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
  }, [deckId]);

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">학습할 카드가 없습니다</p>
          <Button variant="primary" onClick={() => navigate(`/deck/${deckId}`)}>
            덱으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-3 sm:px-0">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-4 sm:mb-6">학습 완료!</h1>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">총 {cards.length}개의 카드를 학습했습니다</p>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3">
                <p className="text-[10px] sm:text-xs text-gray-500">다시 학습</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.again}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3">
                <p className="text-[10px] sm:text-xs text-gray-500">어려움</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.hard}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3">
                <p className="text-[10px] sm:text-xs text-gray-500">쉬움</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.good}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3">
                <p className="text-[10px] sm:text-xs text-gray-500">암기 완료</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.easy}</p>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full text-sm sm:text-base"
            onClick={() => navigate(`/deck/${deckId}`)}
          >
            덱으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const frontText = isReversed ? currentCard.back : currentCard.front;
  const backText = isReversed ? currentCard.front : currentCard.back;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" className="text-xs sm:text-base py-1 sm:py-2" onClick={() => navigate(`/deck/${deckId}`)}>
                ← 나가기
              </Button>
              <div className="text-xs sm:text-sm text-gray-600">
                {currentIndex + 1} / {cards.length}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3"
              onClick={() => setIsReversed(!isReversed)}
            >
              {isReversed ? '뒷면→앞면' : '앞면→뒷면'}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 sm:mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <StudyCard
            frontText={frontText}
            backText={backText}
            memo={currentCard.memo}
            isFlipped={isFlipped}
            isReversed={isReversed}
            onFlip={() => setIsFlipped(!isFlipped)}
          />
        </div>

        {/* Answer Buttons */}
        {isFlipped && (
          <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAnswer(Difficulty.AGAIN)}
              className="border-red-500 text-red-600 hover:bg-red-50 sm:flex-1 sm:min-w-[120px]"
            >
              <div className="text-center">
                <div className="font-bold text-xs sm:text-base">다시</div>
                <div className="text-[10px] sm:text-xs">(1)</div>
              </div>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAnswer(Difficulty.HARD)}
              className="border-orange-500 text-orange-600 hover:bg-orange-50 sm:flex-1 sm:min-w-[120px]"
            >
              <div className="text-center">
                <div className="font-bold text-xs sm:text-base">어려움</div>
                <div className="text-[10px] sm:text-xs">(2)</div>
              </div>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAnswer(Difficulty.GOOD)}
              className="border-blue-500 text-blue-600 hover:bg-blue-50 sm:flex-1 sm:min-w-[120px]"
            >
              <div className="text-center">
                <div className="font-bold text-xs sm:text-base">쉬움</div>
                <div className="text-[10px] sm:text-xs">(3)</div>
              </div>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAnswer(Difficulty.EASY)}
              className="border-green-500 text-green-600 hover:bg-green-50 sm:flex-1 sm:min-w-[120px]"
            >
              <div className="text-center">
                <div className="font-bold text-xs sm:text-base">완료</div>
                <div className="text-[10px] sm:text-xs">(4)</div>
              </div>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
