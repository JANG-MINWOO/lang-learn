'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 로딩 상태를 표시하는 스피너 컴포넌트 (파스텔 옐로우 테마)
 * Framer Motion으로 애니메이션 적용
 *
 * @param message - 표시할 로딩 메시지
 * @param fullScreen - 전체 화면 모드 여부
 * @param size - 스피너 크기 (sm, md, lg)
 */
export default function LoadingSpinner({
  message = '로딩 중...',
  fullScreen = false,
  size = 'md',
}: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? 'min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center'
    : 'flex items-center justify-center py-8';

  const sizes = {
    sm: 'w-8 h-8 border-2',
    md: 'w-16 h-16 border-4',
    lg: 'w-24 h-24 border-[6px]',
  };

  return (
    <div className={containerClass}>
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={cn(
            sizes[size],
            'border-primary-500 border-t-transparent rounded-full mx-auto mb-4'
          )}
        />

        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 font-medium"
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  );
}
