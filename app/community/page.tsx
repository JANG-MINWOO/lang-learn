'use client';

import { motion } from 'framer-motion';
import Header from '../../src/components/layout/Header';
import { FaUsers, FaRocket } from 'react-icons/fa';
import { fadeIn } from '../../src/lib/animations';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <Header />

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <FaUsers className="text-5xl text-white" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              커뮤니티
            </h1>

            <p className="text-xl text-gray-600 mb-10">
              곧 공개될 기능입니다! 다른 학습자들과 덱을 공유하고 함께 성장하세요.
            </p>

            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary-100 text-primary-700 rounded-full">
              <FaRocket />
              <span className="font-medium">준비 중입니다</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
