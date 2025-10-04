import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Card } from '../types';
import { Difficulty } from '../types';
import Button from '../components/Button';

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

  // 카드 가져오기 (최대 10개)
  useEffect(() => {
    if (!deckId) return;

    const fetchCards = async () => {
      try {
        const q = query(collection(db, 'cards'), where('deckId', '==', deckId));
        const snapshot = await getDocs(q);

        const cardData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          nextReviewDate: doc.data().nextReviewDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Card[];

        // 복습이 필요한 카드 우선, 최대 10개
        const today = new Date();
        const dueCards = cardData.filter((card) => card.nextReviewDate <= today);
        const studyCards = dueCards.length > 0 ? dueCards : cardData;

        setCards(studyCards.slice(0, 10));
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
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (!isFlipped) {
          setIsFlipped(true);
        }
        return;
      }

      // 답변 선택 (카드가 플립된 상태에서만)
      if (!isFlipped) return;

      if (e.key === '1') handleAnswer(Difficulty.AGAIN);
      else if (e.key === '2') handleAnswer(Difficulty.HARD);
      else if (e.key === '3') handleAnswer(Difficulty.GOOD);
      else if (e.key === '4') handleAnswer(Difficulty.EASY);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, isComplete, currentIndex]);

  // 간격 반복 알고리즘
  const calculateNextReview = (card: Card, difficulty: Difficulty) => {
    let newInterval = card.interval;
    let newEaseFactor = card.easeFactor;

    switch (difficulty) {
      case Difficulty.AGAIN:
        newInterval = 0;
        newEaseFactor = Math.max(1.3, card.easeFactor - 0.2);
        break;
      case Difficulty.HARD:
        newInterval = Math.max(1, card.interval * 1.2);
        newEaseFactor = Math.max(1.3, card.easeFactor - 0.15);
        break;
      case Difficulty.GOOD:
        newInterval = Math.max(3, card.interval * 2.5);
        break;
      case Difficulty.EASY:
        newInterval = Math.max(7, card.interval * 4);
        newEaseFactor = card.easeFactor + 0.1;
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
      await updateDoc(doc(db, 'cards', currentCard.id), {
        interval,
        easeFactor,
        nextReviewDate: Timestamp.fromDate(nextReviewDate),
        reviewCount: currentCard.reviewCount + 1,
        updatedAt: Timestamp.now(),
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
