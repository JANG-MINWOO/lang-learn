'use client';

import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

/**
 * 재사용 가능한 버튼 컴포넌트 (파스텔 옐로우 테마)
 * Framer Motion으로 애니메이션 적용
 *
 * @param variant - 버튼 스타일
 *   - primary: 파스텔 옐로우 그라디언트 (메인 CTA)
 *   - secondary: 오렌지 그라디언트
 *   - outline: 테두리만
 *   - ghost: 배경 없음
 *   - accent: 강조용 (진한 옐로우)
 *   - danger: 위험 동작 (빨강)
 * @param size - 버튼 크기 (sm, md, lg)
 * @param isLoading - 로딩 상태
 * @param fullWidth - 전체 너비 사용
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center gap-2',
      'font-semibold rounded-full transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      fullWidth && 'w-full'
    );

    const variants = {
      primary: cn(
        'bg-gradient-to-r from-primary-500 to-secondary-500',
        'text-white shadow-lg',
        'hover:shadow-2xl hover:scale-105',
        'focus:ring-primary-400',
        'active:scale-100'
      ),
      secondary: cn(
        'bg-gradient-to-r from-secondary-400 to-accent-500',
        'text-white shadow-md',
        'hover:shadow-xl hover:scale-105',
        'focus:ring-secondary-400',
        'active:scale-100'
      ),
      outline: cn(
        'border-2 border-primary-300 text-primary-700',
        'hover:bg-primary-50 hover:border-primary-500',
        'focus:ring-primary-300',
        'active:bg-primary-100'
      ),
      ghost: cn(
        'text-gray-700 hover:bg-primary-50',
        'focus:ring-primary-200',
        'active:bg-primary-100'
      ),
      accent: cn(
        'bg-gradient-to-br from-primary-400 to-primary-600',
        'text-white shadow-md',
        'hover:shadow-lg hover:scale-105',
        'focus:ring-primary-400',
        'active:scale-100'
      ),
      danger: cn(
        'bg-gradient-to-r from-red-500 to-red-600',
        'text-white shadow-md',
        'hover:shadow-lg hover:scale-105',
        'focus:ring-red-400',
        'active:scale-100'
      ),
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>처리 중...</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
