'use client';

import { HTMLAttributes, ReactNode, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'outline' | 'elevated';
  hover?: boolean;
  clickable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

/**
 * 재사용 가능한 카드 컴포넌트 (파스텔 옐로우 테마)
 * Framer Motion으로 호버 애니메이션 적용
 *
 * @param variant - 카드 스타일
 *   - default: 기본 흰색 배경
 *   - gradient: 파스텔 옐로우 그라디언트 배경
 *   - outline: 테두리만
 *   - elevated: 큰 그림자
 * @param hover - 호버 애니메이션 활성화
 * @param clickable - 클릭 가능한 카드 (커서 포인터)
 * @param padding - 내부 여백
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      hover = false,
      clickable = false,
      padding = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'rounded-2xl transition-all duration-200',
      clickable && 'cursor-pointer',
      hover && 'hover:shadow-xl'
    );

    const variants = {
      default: 'bg-white border border-primary-100 shadow-md',
      gradient: 'bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200 shadow-lg',
      outline: 'border-2 border-primary-300 bg-white',
      elevated: 'bg-white shadow-2xl border border-primary-100',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const motionProps = hover || clickable
      ? {
          whileHover: { y: -4, scale: 1.02 },
          whileTap: clickable ? { scale: 0.98 } : undefined,
        }
      : {};

    return (
      <motion.div
        ref={ref}
        className={cn(baseStyles, variants[variant], paddings[padding], className)}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
