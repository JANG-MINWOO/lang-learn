'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFire, FaTrophy, FaClock, FaBook, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import type { StudyRecord, StudyStats } from '../../types';
import {
  getMonthlyStudyRecords,
  calculateStudyStats,
} from '../../services/studyRecordService';
import { LoadingSpinner } from './LoadingSpinner';

interface StudyCalendarProps {
  userId: string;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white border-2 ${color} rounded-xl p-4 shadow-lg`}
    >
      <Icon className={`text-3xl mb-2 ${color.replace('border', 'text')}`} />
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </motion.div>
  );
}

export function StudyCalendar({ userId }: StudyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [monthlyRecords, studyStats] = await Promise.all([
          getMonthlyStudyRecords(userId, year, month),
          calculateStudyStats(userId),
        ]);
        setRecords(monthlyRecords);
        setStats(studyStats);
      } catch (error) {
        console.error('Failed to fetch study data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId, year, month]);

  // 달력 그리드 생성
  const generateCalendar = () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDayOfWeek = firstDay.getDay(); // 0 (일) ~ 6 (토)
    const daysInMonth = lastDay.getDate();

    const calendar: (number | null)[] = [];

    // 이전 달 빈 칸
    for (let i = 0; i < startDayOfWeek; i++) {
      calendar.push(null);
    }

    // 현재 달 날짜
    for (let day = 1; day <= daysInMonth; day++) {
      calendar.push(day);
    }

    return calendar;
  };

  // 특정 날짜에 학습 기록이 있는지 확인
  const getRecordForDate = (day: number): StudyRecord | undefined => {
    return records.find((record) => {
      const recordDate = new Date(record.studyDate);
      return recordDate.getDate() === day;
    });
  };

  // 이전/다음 달로 이동
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  // 오늘로 이동
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // 학습 시간 포맷 (초 -> 분 or 시간)
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}초`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}시간 ${remainingMinutes}분`;
  };

  if (loading) {
    return <LoadingSpinner message="학습 데이터를 불러오는 중..." />;
  }

  const calendar = generateCalendar();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="space-y-8">
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FaFire}
          label="연속 학습"
          value={`${stats?.currentStreak || 0}일`}
          color="border-red-300"
        />
        <StatCard
          icon={FaTrophy}
          label="총 학습일"
          value={`${stats?.totalDays || 0}일`}
          color="border-yellow-300"
        />
        <StatCard
          icon={FaBook}
          label="총 학습 카드"
          value={`${stats?.totalCards || 0}개`}
          color="border-blue-300"
        />
        <StatCard
          icon={FaClock}
          label="평균 카드/일"
          value={`${stats?.averageCardsPerDay || 0}개`}
          color="border-green-300"
        />
      </div>

      {/* 이번 달 요약 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-100 to-secondary-100 border-2 border-primary-300 rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-3">이번 달 학습</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-3xl font-bold text-primary-700">
              {stats?.thisMonthDays || 0}
            </div>
            <div className="text-sm text-gray-700">학습한 일수</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-secondary-700">
              {stats?.thisMonthCards || 0}
            </div>
            <div className="text-sm text-gray-700">학습한 카드</div>
          </div>
        </div>
      </motion.div>

      {/* 달력 컨트롤 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {year}년 {month}월
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="이전 달"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
          >
            오늘
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="다음 달"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* 달력 그리드 */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-lg">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`text-center text-sm font-semibold py-2 ${
                index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-2">
          {calendar.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const record = getRecordForDate(day);
            const isToday =
              year === new Date().getFullYear() &&
              month === new Date().getMonth() + 1 &&
              day === new Date().getDate();

            return (
              <motion.div
                key={day}
                whileHover={{ scale: record ? 1.05 : 1 }}
                className={`aspect-square rounded-lg border-2 p-2 cursor-pointer transition-all ${
                  isToday
                    ? 'border-primary-500 bg-primary-50'
                    : record
                    ? 'border-green-300 bg-green-50 hover:bg-green-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                title={
                  record
                    ? `${record.cardsStudied}개 카드 학습, ${formatDuration(record.duration)}`
                    : undefined
                }
              >
                <div className="flex flex-col h-full">
                  <div
                    className={`text-sm font-medium ${
                      isToday
                        ? 'text-primary-700'
                        : record
                        ? 'text-green-700'
                        : 'text-gray-600'
                    }`}
                  >
                    {day}
                  </div>
                  {record && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <FaFire className="text-orange-500 text-lg mb-1" />
                      <div className="text-xs font-semibold text-green-700">
                        {record.cardsStudied}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 최장 연속 기록 */}
      {stats && stats.longestStreak > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 rounded-2xl p-6 text-center"
        >
          <FaTrophy className="text-5xl text-orange-600 mx-auto mb-3" />
          <div className="text-3xl font-bold text-orange-700 mb-2">
            🔥 {stats.longestStreak}일
          </div>
          <div className="text-gray-700">최장 연속 학습 기록</div>
        </motion.div>
      )}
    </div>
  );
}
