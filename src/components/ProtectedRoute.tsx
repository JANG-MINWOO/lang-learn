import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * 인증된 사용자만 접근 가능한 라우트
 * 로그인하지 않은 사용자는 /login으로 리다이렉트
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
