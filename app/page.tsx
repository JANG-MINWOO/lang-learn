'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaBook, FaBrain, FaChartLine, FaUsers, FaRocket, FaHeart, FaClock } from 'react-icons/fa';
import Header from '../src/components/layout/Header';
import { fadeIn, slideUp, staggerContainer, staggerItem } from '../src/lib/animations';
import { useAuth } from '../src/contexts/AuthContext';

export default function LandingPage() {
  const { currentUser } = useAuth();

  const features = [
    {
      icon: FaBrain,
      title: '과학적 학습법',
      description: '간격 반복 학습(Spaced Repetition)으로 장기 기억 형성',
    },
    {
      icon: FaChartLine,
      title: '진도 추적',
      description: '학습 진행 상황을 실시간으로 확인하고 분석',
    },
    {
      icon: FaUsers,
      title: '커뮤니티',
      description: '다른 학습자들과 덱을 공유하고 함께 성장',
    },
    {
      icon: FaRocket,
      title: '빠른 학습',
      description: '효율적인 복습 시스템으로 학습 시간 단축',
    },
  ];

  const stats = [
    { icon: FaBook, value: '10,000+', label: '학습 카드' },
    { icon: FaUsers, value: '1,000+', label: '사용자' },
    { icon: FaHeart, value: '98%', label: '만족도' },
    { icon: FaClock, value: '50%', label: '시간 절약' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-secondary-50">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.div variants={staggerItem} className="mb-6">
              <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                ✨ AI 시대의 언어 학습 플랫폼
              </span>
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
            >
              <span className="block">간격 반복 학습으로</span>
              <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                언어를 마스터하세요
              </span>
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto"
            >
              과학적으로 입증된 간격 반복 학습법으로 효율적으로 외국어를 학습하세요.
              <br className="hidden sm:block" />
              AI가 최적의 복습 시점을 알려드립니다.
            </motion.p>

            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={currentUser ? '/dashboard' : '/signup'}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
              >
                <FaRocket />
                {currentUser ? '학습 시작하기' : '무료로 시작하기'}
              </Link>
              <Link
                href="#about"
                className="px-8 py-4 border-2 border-primary-300 text-primary-700 rounded-full text-lg font-semibold hover:bg-primary-50 transition-all"
              >
                더 알아보기
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Image/Animation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="relative w-full max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                      className="bg-white p-6 rounded-2xl shadow-lg"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl mb-3" />
                      <div className="h-3 bg-gray-200 rounded mb-2" />
                      <div className="h-2 bg-gray-100 rounded w-2/3" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-10 -left-10 w-20 h-20 bg-primary-300 rounded-full opacity-50 blur-xl"
              />
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-10 -right-10 w-32 h-32 bg-secondary-300 rounded-full opacity-50 blur-xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl mb-4">
                  <stat.icon className="text-3xl text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              왜 Language Learning인가요?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              과학적 학습법과 직관적인 인터페이스로 누구나 쉽게 언어를 학습할 수 있습니다
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-primary-100"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={slideUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              지금 바로 시작하세요!
            </h2>
            <p className="text-lg text-primary-50 mb-10">
              무료로 계정을 만들고 효율적인 언어 학습을 경험해보세요
            </p>
            <Link
              href={currentUser ? '/dashboard' : '/signup'}
              className="inline-block px-10 py-4 bg-white text-primary-600 rounded-full text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all"
            >
              {currentUser ? '학습 시작하기' : '무료로 시작하기'}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FaBook className="text-2xl text-primary-400" />
            <span className="text-xl font-bold text-white">Language Learning</span>
          </div>
          <p className="text-sm">© 2025 Language Learning. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
