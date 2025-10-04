import { useState, useCallback } from 'react';

type Validator<T> = (value: any, values: T) => string | undefined;

/**
 * 폼 상태 및 검증을 관리하는 커스텀 훅
 * @param initialValues - 폼 초기값
 * @param validationSchema - 필드별 검증 함수 (선택)
 * @returns 폼 상태, 핸들러, 검증 함수
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: Partial<Record<keyof T, Validator<T>>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  /**
   * 전체 폼 검증
   */
  const validate = useCallback((): boolean => {
    if (!validationSchema) return true;

    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationSchema).forEach((key) => {
      const validator = validationSchema[key as keyof T];
      if (validator) {
        const error = validator(values[key as keyof T], values);
        if (error) {
          newErrors[key as keyof T] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationSchema]);

  /**
   * 필드별 검증
   */
  const validateField = useCallback(
    (field: keyof T): boolean => {
      if (!validationSchema || !validationSchema[field]) return true;

      const error = validationSchema[field]!(values[field], values);
      setErrors((prev) => ({ ...prev, [field]: error }));
      return !error;
    },
    [values, validationSchema]
  );

  /**
   * 필드 값 변경 핸들러
   */
  const handleChange = useCallback(
    (field: keyof T) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValues((prev) => ({ ...prev, [field]: e.target.value }));
        setTouched((prev) => ({ ...prev, [field]: true }));

        // 입력 시 해당 필드 에러 제거
        if (errors[field]) {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      },
    [errors]
  );

  /**
   * 필드 포커스 아웃 핸들러
   */
  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateField(field);
    },
    [validateField]
  );

  /**
   * 폼 초기화
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  /**
   * 에러 직접 설정 (서버 에러 등)
   */
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  /**
   * 값 직접 설정
   */
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    validateField,
    setValues,
    setErrors,
    setFieldError,
    setFieldValue,
    reset,
  };
}
