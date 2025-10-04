import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import Button from '../components/Button';
import Input from '../components/Input';
import { useToast } from '../contexts/ToastContext';
import { processError } from '../utils/errorHandler';
import { useForm } from '../hooks/useForm';

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, validate } = useForm(
    {
      email: '',
      password: '',
    },
    {
      email: (value) => (!value ? '이메일을 입력해주세요' : undefined),
      password: (value) => (!value ? '비밀번호를 입력해주세요' : undefined),
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      showToast('로그인 성공!', 'success');
      navigate('/');
    } catch (error: any) {
      const errorMessage = processError(error, 'Login');
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">로그인</h1>
          <p className="text-gray-600">Language Learning에 오신 것을 환영합니다</p>
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
            placeholder="비밀번호를 입력해주세요"
            value={values.password}
            onChange={handleChange('password')}
            error={errors.password}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? '처리 중...' : '로그인'}
          </Button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-black font-medium hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
