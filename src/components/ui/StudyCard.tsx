'use client';

import { motion } from 'framer-motion';
import { FaVolumeUp } from 'react-icons/fa';
import { useSpeech } from '../../hooks/useSpeech';
import { cn } from '../../lib/utils';

interface StudyCardProps {
  frontText: string;
  backText: string;
  memo?: string;
  isFlipped: boolean;
  isReversed: boolean;
  onFlip: () => void;
}

/**
 * 학습 카드 컴포넌트 (파스텔 옐로우 테마)
 * Framer Motion 플립 애니메이션 + TTS 지원
 */
export default function StudyCard({
  frontText,
  backText,
  memo,
  isFlipped,
  isReversed,
  onFlip,
}: StudyCardProps) {
  const { speak, isSupported } = useSpeech();

  const handleSpeak = (text: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 뒤집기 방지
    speak(text); // 언어 자동 감지
  };

  return (
    <motion.div
      onClick={onFlip}
      className="relative w-full max-w-2xl mx-auto min-h-[500px] cursor-pointer"
      style={{ perspective: '1000px' }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="relative w-full min-h-[500px]"
        initial={{ rotateY: 0 }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 앞면 */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full rounded-3xl p-8 sm:p-12',
            'border-2 border-primary-400 bg-gradient-to-br from-primary-50 via-white to-secondary-50',
            'shadow-2xl',
            'flex flex-col items-center justify-center text-center'
          )}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {!isFlipped && (
            <>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-gray-600 mb-4"
              >
                {isReversed ? '뜻' : '단어/문장'}
              </motion.p>

              <div className="flex items-center justify-center gap-3 mb-8">
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
                >
                  {frontText}
                </motion.p>

                {isSupported && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleSpeak(frontText, e)}
                    className="p-3 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 text-white shadow-lg hover:shadow-xl transition-shadow"
                    aria-label="읽기"
                  >
                    <FaVolumeUp className="text-xl" />
                  </motion.button>
                )}
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-500 text-sm"
              >
                카드 클릭 또는 스페이스바로 답 확인
              </motion.p>
            </>
          )}
        </div>

        {/* 뒷면 */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full rounded-3xl p-8 sm:p-12',
            'border-2 border-secondary-400 bg-gradient-to-br from-secondary-50 via-white to-primary-50',
            'shadow-2xl',
            'flex flex-col items-center justify-center text-center'
          )}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {isFlipped && (
            <>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-gray-600 mb-2"
              >
                {isReversed ? '단어/문장' : '뜻'}
              </motion.p>

              <div className="flex items-center justify-center gap-3 mb-6">
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl sm:text-4xl font-bold text-gray-800"
                >
                  {backText}
                </motion.p>

                {isSupported && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleSpeak(backText, e)}
                    className="p-2 rounded-full bg-gradient-to-br from-secondary-400 to-accent-400 text-white shadow-lg hover:shadow-xl transition-shadow"
                    aria-label="읽기"
                  >
                    <FaVolumeUp className="text-lg" />
                  </motion.button>
                )}
              </div>

              <div className="w-24 h-1 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full mx-auto my-6" />

              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-gray-600 mb-2"
              >
                {isReversed ? '뜻' : '단어/문장'}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6"
              >
                {frontText}
              </motion.p>

              {memo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 p-4 bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200 rounded-xl shadow-sm"
                >
                  <p className="text-xs text-gray-600 mb-1 font-semibold">메모</p>
                  <p className="text-sm text-gray-700">{memo}</p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
