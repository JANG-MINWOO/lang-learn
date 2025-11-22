'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon?: IconType;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * 빈 상태를 표시하는 컴포넌트 (파스텔 옐로우 테마)
 *
 * @param icon - 표시할 아이콘
 * @param title - 제목
 * @param description - 설명
 * @param action - 액션 버튼 (예: "추가하기" 버튼)
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'text-center py-16 px-4',
        'bg-gradient-to-br from-primary-50/50 to-secondary-50/50',
        'border-2 border-dashed border-primary-300 rounded-2xl',
        className
      )}
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl mb-6"
        >
          <Icon className="text-4xl text-primary-600" />
        </motion.div>
      )}

      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

      {description && (
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
