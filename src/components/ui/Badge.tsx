'use client';

import { HTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  children: ReactNode;
}

/**
 * 재사용 가능한 배지 컴포넌트 (파스텔 옐로우 테마)
 *
 * @param variant - 배지 스타일
 * @param size - 배지 크기
 * @param dot - 점 표시 여부
 */
const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', dot = false, className, children, ...props }, ref) => {
    const baseStyles = cn(
      'inline-flex items-center gap-1.5 font-semibold rounded-full',
      'transition-all duration-200'
    );

    const variants = {
      default: 'bg-gray-100 text-gray-700',
      primary: 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700',
      secondary: 'bg-secondary-100 text-secondary-700',
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      danger: 'bg-red-100 text-red-700',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base',
    };

    const dotColors = {
      default: 'bg-gray-500',
      primary: 'bg-primary-500',
      secondary: 'bg-secondary-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {dot && <span className={cn('w-2 h-2 rounded-full', dotColors[variant])} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
