import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Card } from '../types';
import { Difficulty } from '../types';
import Button from '../components/Button';
import { STUDY_CONFIG, KEYBOARD_SHORTCUTS } from '../utils/constants';
import { getStudyCards, updateCard } from '../services/cardService';

export default function Study() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
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
        console.error('Error fetching cards:', error);
        setLoading(false);
      }
    };

    fetchCards();
  }, [deckId]);

  // 키보드 단축키
  useEffect(() => {
    if (isComplete) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // 스페이스바로 카드 플립
      if (e.key === KEYBOARD_SHORTCUTS.FLIP_CARD || e.code === 'Space') {
        e.preventDefault();
        if (!isFlipped) {
          setIsFlipped(true);
        }
        return;
      }

      // 답변 선택 (카드가 플립된 상태에서만)
      if (!isFlipped) return;

      if (e.key === KEYBOARD_SHORTCUTS.AGAIN) handleAnswer(Difficulty.AGAIN);
      else if (e.key === KEYBOARD_SHORTCUTS.HARD) handleAnswer(Difficulty.HARD);
      else if (e.key === KEYBOARD_SHORTCUTS.GOOD) handleAnswer(Difficulty.GOOD);
      else if (e.key === KEYBOARD_SHORTCUTS.EASY) handleAnswer(Difficulty.EASY);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, isComplete, currentIndex]);

  // 간격 반복 알고리즘
  const calculateNextReview = (card: Card, difficulty: Difficulty) => {
    let newInterval = card.interval;
    let newEaseFactor = card.easeFactor;

    const config = STUDY_CONFIG.DIFFICULTY_ADJUSTMENTS[difficulty];
    const minInterval = STUDY_CONFIG.MIN_INTERVALS[difficulty];

    switch (difficulty) {
      case Difficulty.AGAIN:
        newInterval = minInterval;
        newEaseFactor = Math.max(
          STUDY_CONFIG.MIN_EASE_FACTOR,
          card.easeFactor + config.easeChange
        );
        break;
      case Difficulty.HARD:
        newInterval = Math.max(minInterval, card.interval * config.intervalMultiplier);
        newEaseFactor = Math.max(
          STUDY_CONFIG.MIN_EASE_FACTOR,
          card.easeFactor + config.easeChange
        );
        break;
      case Difficulty.GOOD:
        newInterval = Math.max(minInterval, card.interval * config.intervalMultiplier);
        break;
      case Difficulty.EASY:
        newInterval = Math.max(minInterval, card.interval * config.intervalMultiplier);
        newEaseFactor = card.easeFactor + config.easeChange;
        break;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + Math.ceil(newInterval));

    return {
      interval: newInterval,
      easeFactor: newEaseFactor,
      nextReviewDate,
    };
  };

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
      console.error('Error updating card:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">카드를 불러오는 중...</p>
      </div>
    );
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-black mb-6">학습 완료!</h1>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
            <p className="text-gray-600 mb-4">총 {cards.length}개의 카드를 학습했습니다</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500">다시 학습</p>
                <p className="text-2xl font-bold text-red-600">{stats.again}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500">어려움</p>
                <p className="text-2xl font-bold text-orange-600">{stats.hard}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500">쉬움</p>
                <p className="text-2xl font-bold text-blue-600">{stats.good}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500">암기 완료</p>
                <p className="text-2xl font-bold text-green-600">{stats.easy}</p>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
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
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(`/deck/${deckId}`)}>
                ← 나가기
              </Button>
              <div className="text-sm text-gray-600">
                {currentIndex + 1} / {cards.length}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReversed(!isReversed)}
            >
              {isReversed ? '뒷면 → 앞면' : '앞면 → 뒷면'}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          {/* Card */}
          <div
            className="bg-white border-4 border-black rounded-2xl p-12 min-h-[400px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                {isReversed ? '뜻' : '단어/문장'}
              </p>
              <p className="text-4xl font-bold text-black mb-8">{frontText}</p>

              {isFlipped && (
                <>
                  <div className="border-t-2 border-gray-300 my-6 w-32 mx-auto" />
                  <p className="text-sm text-gray-500 mb-2">
                    {isReversed ? '단어/문장' : '뜻'}
                  </p>
                  <p className="text-2xl text-gray-700 mb-4">{backText}</p>

                  {currentCard.memo && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">메모</p>
                      <p className="text-sm text-gray-600">{currentCard.memo}</p>
                    </div>
                  )}
                </>
              )}

              {!isFlipped && (
                <p className="text-gray-400 text-sm">카드 클릭 또는 스페이스바로 답 확인</p>
              )}
            </div>
          </div>
        </div>

        {/* Answer Buttons */}
        {isFlipped && (
          <div className="flex gap-3 overflow-x-auto">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAnswer(Difficulty.AGAIN)}
              className="border-red-500 text-red-600 hover:bg-red-50 flex-1 min-w-[120px]"
            >
              <div className="text-center">
                <div className="font-bold">다시 학습</div>
                <div className="text-xs">즉시 다시 (1)</div>
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAnswer(Difficulty.HARD)}
              className="border-orange-500 text-orange-600 hover:bg-orange-50 flex-1 min-w-[120px]"
            >
              <div className="text-center">
                <div className="font-bold">어려움</div>
                <div className="text-xs">짧은 간격 (2)</div>
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAnswer(Difficulty.GOOD)}
              className="border-blue-500 text-blue-600 hover:bg-blue-50 flex-1 min-w-[120px]"
            >
              <div className="text-center">
                <div className="font-bold">쉬움</div>
                <div className="text-xs">중간 간격 (3)</div>
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAnswer(Difficulty.EASY)}
              className="border-green-500 text-green-600 hover:bg-green-50 flex-1 min-w-[120px]"
            >
              <div className="text-center">
                <div className="font-bold">암기 완료</div>
                <div className="text-xs">긴 간격 (4)</div>
              </div>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
