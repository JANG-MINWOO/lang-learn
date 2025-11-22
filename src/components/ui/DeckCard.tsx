'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaFire, FaClock } from 'react-icons/fa';
import { cn } from '../../lib/utils';

interface DeckCardProps {
  name: string;
  description?: string;
  cardCount: number;
  dueCount: number;
  lastStudied?: Date;
  onClick?: () => void;
}

/**
 * 덱 카드 컴포넌트 (파스텔 옐로우 테마)
 * React.memo로 최적화 + Framer Motion 애니메이션
 *
 * @param name - 덱 이름
 * @param description - 덱 설명
 * @param cardCount - 전체 카드 수
 * @param dueCount - 복습 대기 카드 수
 * @param lastStudied - 마지막 학습 날짜
 * @param onClick - 클릭 핸들러
 */
const DeckCard = memo(
  function DeckCard({
    name,
    description,
    cardCount,
    dueCount,
    lastStudied,
    onClick,
  }: DeckCardProps) {
    const hasDueCards = dueCount > 0;

    return (
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
          'p-6 rounded-2xl cursor-pointer transition-all duration-200',
          'border-2 shadow-lg',
          hasDueCards
            ? 'border-primary-400 bg-gradient-to-br from-primary-50 via-white to-secondary-50 hover:shadow-2xl'
            : 'border-primary-200 bg-white hover:border-primary-400 hover:shadow-xl'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl flex items-center justify-center shadow-md">
              <FaBook className="text-xl text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{name}</h3>
              {description && (
                <p className="text-sm text-gray-600 line-clamp-1 mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>

          {hasDueCards && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="flex items-center gap-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md"
            >
              <FaFire className="text-xs" />
              {dueCount}
            </motion.div>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <FaBook className="text-sm text-primary-600" />
            </div>
            <span className="font-medium">{cardCount}개 카드</span>
          </div>

          {lastStudied && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                <FaClock className="text-sm text-secondary-600" />
              </div>
              <span className="font-medium">
                {new Date(lastStudied).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>

        {/* Due cards indicator */}
        {hasDueCards && (
          <div className="mt-4 pt-4 border-t border-primary-200">
            <p className="text-sm font-semibold text-primary-700">
              {dueCount}개 카드 복습 대기 중
            </p>
          </div>
        )}
      </motion.div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.name === nextProps.name &&
      prevProps.description === nextProps.description &&
      prevProps.cardCount === nextProps.cardCount &&
      prevProps.dueCount === nextProps.dueCount &&
      prevProps.lastStudied === nextProps.lastStudied &&
      prevProps.onClick === nextProps.onClick
    );
  }
);

export default DeckCard;
