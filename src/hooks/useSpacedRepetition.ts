import { Difficulty } from '../types';
import type { Card } from '../types';
import { STUDY_CONFIG } from '../utils/constants';

interface SpacedRepetitionResult {
  interval: number;
  easeFactor: number;
  nextReviewDate: Date;
}

/**
 * 간격 반복 학습(Spaced Repetition) 알고리즘을 제공하는 커스텀 훅
 * SuperMemo SM-2 알고리즘 기반
 */
export function useSpacedRepetition() {
  /**
   * 카드의 다음 복습 정보를 계산
   * @param card - 현재 카드
   * @param difficulty - 사용자가 선택한 난이도
   * @returns 새로운 interval, easeFactor, nextReviewDate
   */
  const calculateNextReview = (
    card: Card,
    difficulty: Difficulty
  ): SpacedRepetitionResult => {
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

  return { calculateNextReview };
}
