import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS 클래스를 병합하는 유틸리티 함수
 * clsx로 조건부 클래스를 처리하고 tailwind-merge로 충돌 방지
 *
 * @example
 * cn('px-2 py-1', 'px-4') // 'py-1 px-4' (px-4가 px-2를 덮어씀)
 * cn('text-red-500', condition && 'text-blue-500') // 조건부 클래스
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
