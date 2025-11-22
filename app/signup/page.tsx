'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaBook, FaCheckCircle } from 'react-icons/fa';
import { auth } from '../../src/config/firebase';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button, Input, Card, LoadingSpinner } from '../../src/components/ui';
import { createUserProfile } from '../../src/services/userService';
import { useToast } from '../../src/contexts/ToastContext';
import { processError } from '../../src/utils/errorHandler';
import { useForm } from '../../src/hooks/useForm';
import * as validators from '../../src/utils/validators';
import { fadeIn, slideUp, staggerContainer, staggerItem } from '../../src/lib/animations';

export default function SignUp() {
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, validate, setValues, setErrors } = useForm(
    {
      email: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      phoneNumber: '',
    },
    {
      email: validators.email,
      password: validators.password,
      confirmPassword: (value, allValues) =>
        validators.confirmPassword(allValues.password, value),
      nickname: (value) => validators.required(value, '닉네임'),
      phoneNumber: validators.phoneNumber,
    }
  );

  // 이미 로그인된 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (!authLoading && currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, authLoading, router]);

  // 전화번호 입력 시 자동 포맷팅
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = validators.formatPhoneNumber(e.target.value);
    setValues((prev) => ({ ...prev, phoneNumber: formatted }));
  };

  // 비밀번호 확인 입력 시 실시간 검증
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValues((prev) => ({ ...prev, confirmPassword: value }));

    // 실시간으로 비밀번호 일치 여부 검증
    if (value && values.password !== value) {
      setErrors((prev) => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다' }));
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      // Firebase Authentication으로 사용자 생성
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      // Firestore에 사용자 추가 정보 저장
      await createUserProfile(userCredential.user.uid, {
        email: values.email,
        nickname: values.nickname,
        phoneNumber: values.phoneNumber,
      });

      // 회원가입 성공 후 대시보드로 이동
      showToast('회원가입 성공!', 'success');
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage = processError(error, 'SignUp');
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner fullScreen message="로딩 중..." />;
  }

  if (currentUser) {
    return null;
  }

  // 비밀번호 강도 체크
  const passwordStrength = values.password.length >= 8 ? 'strong' : values.password.length >= 6 ? 'medium' : 'weak';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="text-center mb-8"
        >
          <Link href="/" className="inline-block mb-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
            >
              <FaBook className="text-3xl text-white" />
            </motion.div>
          </Link>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
            회원가입
          </h1>
          <p className="text-gray-600">Language Learning 계정을 만드세요</p>
        </motion.div>

        {/* Sign Up Form Card */}
        <motion.div variants={slideUp} initial="hidden" animate="visible">
          <Card variant="elevated" padding="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                <motion.div variants={staggerItem}>
                  <Input
                    label="이메일"
                    type="email"
                    placeholder="example@email.com"
                    value={values.email}
                    onChange={handleChange('email')}
                    error={errors.email}
                    leftIcon={<FaEnvelope />}
                    required
                  />
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Input
                    label="비밀번호"
                    type="password"
                    placeholder="최소 6자 이상"
                    value={values.password}
                    onChange={handleChange('password')}
                    error={errors.password}
                    leftIcon={<FaLock />}
                    helperText={
                      values.password &&
                      (passwordStrength === 'strong'
                        ? '✓ 강한 비밀번호입니다'
                        : passwordStrength === 'medium'
                        ? '보통 강도의 비밀번호입니다'
                        : '더 긴 비밀번호를 사용하세요')
                    }
                    required
                  />
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Input
                    label="비밀번호 확인"
                    type="password"
                    placeholder="비밀번호를 다시 입력해주세요"
                    value={values.confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    error={errors.confirmPassword}
                    leftIcon={<FaLock />}
                    rightIcon={
                      values.confirmPassword &&
                      values.password === values.confirmPassword && (
                        <FaCheckCircle className="text-green-500" />
                      )
                    }
                    required
                  />
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Input
                    label="닉네임"
                    type="text"
                    placeholder="닉네임을 입력해주세요"
                    value={values.nickname}
                    onChange={handleChange('nickname')}
                    error={errors.nickname}
                    leftIcon={<FaUser />}
                    required
                  />
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Input
                    label="전화번호"
                    type="tel"
                    placeholder="010-1234-5678"
                    value={values.phoneNumber}
                    onChange={handlePhoneNumberChange}
                    error={errors.phoneNumber}
                    leftIcon={<FaPhone />}
                    helperText="자동으로 포맷됩니다"
                  />
                </motion.div>

                <motion.div variants={staggerItem} className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={loading}
                  >
                    {loading ? '회원가입 중...' : '회원가입'}
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </Card>
        </motion.div>

        {/* Login Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-600 text-sm mt-6"
        >
          이미 계정이 있으신가요?{' '}
          <Link
            href="/login"
            className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            로그인
          </Link>
        </motion.p>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-4"
        >
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
