'use client';

import { HTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: ReactNode;
}

/**
 * 재사용 가능한 컨테이너 컴포넌트
 * 반응형 max-width 설정
 *
 * @param size - 컨테이너 크기
 *   - sm: 640px
 *   - md: 768px
 *   - lg: 1024px
 *   - xl: 1280px
 *   - full: 100%
 */
const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = 'xl', className, children, ...props }, ref) => {
    const sizes = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-7xl',
      full: 'max-w-full',
    };

    return (
      <div
        ref={ref}
        className={cn('mx-auto px-4 sm:px-6 lg:px-8', sizes[size], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export default Container;
