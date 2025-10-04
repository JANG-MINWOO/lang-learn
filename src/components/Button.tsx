import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 재사용 가능한 버튼 컴포넌트
 * @param variant - 버튼 스타일 (primary, secondary, outline, ghost)
 * @param size - 버튼 크기 (sm, md, lg)
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-to-b from-gray-900 to-black text-white hover:from-gray-800 hover:to-gray-900 active:from-black active:to-black shadow-sm hover:shadow-md active:shadow-sm',
    secondary: 'bg-gradient-to-b from-gray-100 to-gray-200 text-black hover:from-gray-200 hover:to-gray-300 active:from-gray-300 active:to-gray-400 shadow-sm hover:shadow-md active:shadow-sm',
    outline: 'border-2 border-black text-black hover:bg-gradient-to-b hover:from-gray-900 hover:to-black hover:text-white shadow-sm hover:shadow-md',
    ghost: 'text-black hover:bg-gradient-to-b hover:from-gray-50 hover:to-gray-100 active:from-gray-100 active:to-gray-200',
    accent: 'bg-gradient-to-b from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 active:from-gray-900 active:to-black shadow-md hover:shadow-lg active:shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
