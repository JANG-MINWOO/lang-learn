import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * 재사용 가능한 입력 필드 컴포넌트
 * @param label - 입력 필드 레이블
 * @param error - 에러 메시지 (표시 시 빨간색 border)
 */
export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
