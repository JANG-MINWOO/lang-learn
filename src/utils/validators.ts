/**
 * 폼 검증 유틸리티 함수 모음
 * 각 함수는 검증 실패 시 에러 메시지를, 성공 시 undefined를 반환합니다.
 */

/**
 * 이메일 형식 검증
 * @param value - 검증할 이메일 값
 * @returns 에러 메시지 또는 undefined
 */
export function email(value: string): string | undefined {
  if (!value) return '이메일을 입력해주세요';

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(value)) {
    return '올바른 이메일 형식이 아닙니다';
  }

  return undefined;
}

/**
 * 비밀번호 검증 (최소 6자)
 * @param value - 검증할 비밀번호 값
 * @returns 에러 메시지 또는 undefined
 */
export function password(value: string): string | undefined {
  if (!value) return '비밀번호를 입력해주세요';

  if (value.length < 6) {
    return '비밀번호는 최소 6자 이상이어야 합니다';
  }

  return undefined;
}

/**
 * 비밀번호 확인 검증
 * @param password - 원본 비밀번호
 * @param confirmPassword - 확인 비밀번호
 * @returns 에러 메시지 또는 undefined
 */
export function confirmPassword(
  password: string,
  confirmPassword: string
): string | undefined {
  if (password !== confirmPassword) {
    return '비밀번호가 일치하지 않습니다';
  }

  return undefined;
}

/**
 * 필수 입력 검증
 * @param value - 검증할 값
 * @param fieldName - 필드 이름 (에러 메시지에 사용)
 * @returns 에러 메시지 또는 undefined
 */
export function required(value: string, fieldName: string): string | undefined {
  if (!value || !value.trim()) {
    return `${fieldName}을(를) 입력해주세요`;
  }

  return undefined;
}

/**
 * 전화번호 형식 검증 (예: 010-1234-5678)
 * @param value - 검증할 전화번호 값
 * @returns 에러 메시지 또는 undefined
 */
export function phoneNumber(value: string): string | undefined {
  if (!value) return '전화번호를 입력해주세요';

  const phoneRegex = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
  if (!phoneRegex.test(value)) {
    return '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)';
  }

  return undefined;
}

/**
 * 최소 길이 검증
 * @param value - 검증할 값
 * @param min - 최소 길이
 * @param fieldName - 필드 이름 (에러 메시지에 사용)
 * @returns 에러 메시지 또는 undefined
 */
export function minLength(
  value: string,
  min: number,
  fieldName: string
): string | undefined {
  if (value.length < min) {
    return `${fieldName}은(는) 최소 ${min}자 이상이어야 합니다`;
  }

  return undefined;
}

/**
 * 최대 길이 검증
 * @param value - 검증할 값
 * @param max - 최대 길이
 * @param fieldName - 필드 이름 (에러 메시지에 사용)
 * @returns 에러 메시지 또는 undefined
 */
export function maxLength(
  value: string,
  max: number,
  fieldName: string
): string | undefined {
  if (value.length > max) {
    return `${fieldName}은(는) 최대 ${max}자까지 입력 가능합니다`;
  }

  return undefined;
}

/**
 * 검증 함수들을 하나의 객체로 내보내기 (named export와 함께 사용 가능)
 */
export const validators = {
  email,
  password,
  confirmPassword,
  required,
  phoneNumber,
  minLength,
  maxLength,
};
