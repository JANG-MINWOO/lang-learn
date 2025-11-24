'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaChartLine } from 'react-icons/fa';
import { Container, Button, LoadingSpinner, StudyCalendar } from '../../src/components/ui';
import { useAuth } from '../../src/contexts/AuthContext';
import { fadeIn, slideUp } from '../../src/lib/animations';

export default function StatsPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  // 로그인하지 않은 사용자 리다이렉트
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return <LoadingSpinner message="사용자 정보를 확인하는 중..." fullScreen />;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-16">
      <Container className="py-8">
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="md"
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2"
              >
                <FaArrowLeft />
                대시보드
              </Button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent flex items-center gap-3">
                  <FaChartLine />
                  학습 통계
                </h1>
                <p className="text-gray-600 mt-2">나의 학습 기록과 성장을 확인하세요</p>
              </div>
            </div>
          </div>

          {/* 학습 달력 */}
          <motion.div variants={slideUp} initial="hidden" animate="visible">
            <StudyCalendar userId={currentUser.uid} />
          </motion.div>

          {/* 도움말 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Tip</h3>
            <ul className="space-y-2 text-blue-800">
              <li>• 연속 학습 기록을 유지하면 더 효과적인 학습이 가능합니다</li>
              <li>• 매일 조금씩이라도 꾸준히 학습하는 것이 중요해요</li>
              <li>• 학습 달력에서 🔥 아이콘은 해당 날짜에 학습한 카드 수를 나타냅니다</li>
            </ul>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
}
