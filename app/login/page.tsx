'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FaEnvelope, FaLock, FaBook } from 'react-icons/fa';
import { auth } from '../../src/config/firebase';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button, Input, Card, LoadingSpinner } from '../../src/components/ui';
import { useToast } from '../../src/contexts/ToastContext';
import { processError } from '../../src/utils/errorHandler';
import { useForm } from '../../src/hooks/useForm';
import * as validators from '../../src/utils/validators';
import { fadeIn, slideUp } from '../../src/lib/animations';

export default function Login() {
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, validate } = useForm(
    {
      email: '',
      password: '',
    },
    {
      email: validators.email,
      password: validators.password,
    }
  );

  // 이미 로그인된 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (!authLoading && currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      showToast('로그인 성공!', 'success');
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage = processError(error, 'Login');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
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
            로그인
          </h1>
          <p className="text-gray-600">Language Learning에 오신 것을 환영합니다</p>
        </motion.div>

        {/* Login Form Card */}
        <motion.div variants={slideUp} initial="hidden" animate="visible">
          <Card variant="elevated" padding="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
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

              <Input
                label="비밀번호"
                type="password"
                placeholder="비밀번호를 입력해주세요"
                value={values.password}
                onChange={handleChange('password')}
                error={errors.password}
                leftIcon={<FaLock />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
              >
                {loading ? '로그인 중...' : '로그인'}
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Sign Up Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-600 text-sm mt-6"
        >
          계정이 없으신가요?{' '}
          <Link
            href="/signup"
            className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            회원가입
          </Link>
        </motion.p>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
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
