import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import Button from '../components/Button';
import Input from '../components/Input';
import { createUserProfile } from '../services/userService';
import { useToast } from '../contexts/ToastContext';
import { processError } from '../utils/errorHandler';
import { useForm } from '../hooks/useForm';
import * as validators from '../utils/validators';

export default function SignUp() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, validate } = useForm(
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

      // 회원가입 성공 후 홈으로 이동
      showToast('회원가입 성공!', 'success');
      navigate('/');
    } catch (error: any) {
      const errorMessage = processError(error, 'SignUp');
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">회원가입</h1>
          <p className="text-gray-600">Language Learning 계정을 만드세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="이메일"
            type="email"
            placeholder="example@email.com"
            value={values.email}
            onChange={handleChange('email')}
            error={errors.email}
          />

          <Input
            label="비밀번호"
            type="password"
            placeholder="최소 6자 이상"
            value={values.password}
            onChange={handleChange('password')}
            error={errors.password}
          />

          <Input
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호를 다시 입력해주세요"
            value={values.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={errors.confirmPassword}
          />

          <Input
            label="닉네임"
            type="text"
            placeholder="닉네임을 입력해주세요"
            value={values.nickname}
            onChange={handleChange('nickname')}
            error={errors.nickname}
          />

          <Input
            label="전화번호"
            type="tel"
            placeholder="010-1234-5678"
            value={values.phoneNumber}
            onChange={handleChange('phoneNumber')}
            error={errors.phoneNumber}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? '처리 중...' : '회원가입'}
          </Button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-black font-medium hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
