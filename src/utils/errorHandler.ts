import { FIREBASE_ERROR_MESSAGES, ERROR_MESSAGES } from './constants';

/**
 * 커스텀 애플리케이션 에러 인터페이스
 */
export interface AppError extends Error {
  code?: string;
  userMessage?: string;
}

/**
 * AppError 생성 함수
 */
export function createAppError(
  message: string,
  code?: string,
  userMessage?: string
): AppError {
  const error = new Error(message) as AppError;
  error.name = 'AppError';
  error.code = code;
  error.userMessage = userMessage;
  return error;
}

/**
 * Firebase 에러를 사용자 친화적인 한글 메시지로 변환
 */
export function handleFirebaseError(error: any): string {
  if (!error) {
    return ERROR_MESSAGES.DEFAULT;
  }

  // Firebase 에러 코드가 있는 경우
  if (error.code && FIREBASE_ERROR_MESSAGES[error.code]) {
    return FIREBASE_ERROR_MESSAGES[error.code];
  }

  // AppError인 경우
  if (error.name === 'AppError' && error.userMessage) {
    return error.userMessage;
  }

  // 네트워크 에러
  if (error.message?.includes('network') || error.code === 'unavailable') {
    return ERROR_MESSAGES.NETWORK;
  }

  // 권한 에러
  if (error.code === 'permission-denied') {
    return ERROR_MESSAGES.PERMISSION_DENIED;
  }

  // 기본 에러 메시지
  return error.message || ERROR_MESSAGES.DEFAULT;
}

/**
 * 에러를 로그에 기록 (개발 환경에서만)
 */
export function logError(error: any, context?: string) {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  }

  // 프로덕션 환경에서는 에러 추적 서비스로 전송
  // 예: Sentry, LogRocket 등
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error tracking service
  }
}

/**
 * 에러를 처리하고 사용자 메시지를 반환
 */
export function processError(error: any, context?: string): string {
  logError(error, context);
  return handleFirebaseError(error);
}
