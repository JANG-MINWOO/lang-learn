'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaBook, FaSignOutAlt, FaUser, FaHome } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { processError } from '../../utils/errorHandler';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, userProfile } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // 학습 페이지에서는 헤더 표시 안 함
  if (pathname?.startsWith('/study/')) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('로그아웃되었습니다', 'success');
      router.push('/');
    } catch (error) {
      const errorMessage = processError(error, 'Logout');
      showToast(errorMessage, 'error');
    }
  };

  const navItems = [
    { label: '소개', href: '/#about' },
    { label: '학습하기', href: currentUser ? '/dashboard' : '/login' },
    { label: '커뮤니티', href: '/community' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <FaBook className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Language Learning
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}

            {/* Auth Buttons */}
            {currentUser ? (
              <div className="flex items-center gap-4">
                {/* User Info */}
                {userProfile && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaUser className="text-primary-500" />
                    <span className="font-medium">{userProfile.nickname}님</span>
                    {userProfile.provider === 'google' && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        Google
                      </span>
                    )}
                  </div>
                )}

                {/* Dashboard Button (only show if not on dashboard) */}
                {pathname !== '/dashboard' && (
                  <Link
                    href="/dashboard"
                    className="px-5 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors flex items-center gap-2"
                  >
                    <FaHome />
                    <span>대시보드</span>
                  </Link>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 text-gray-700 hover:text-red-600 font-medium transition-colors flex items-center gap-2"
                >
                  <FaSignOutAlt />
                  <span>로그아웃</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-5 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all"
                >
                  회원가입
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
          >
            {isMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-primary-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}

              <div className="pt-3 border-t border-primary-100 space-y-2">
                {currentUser ? (
                  <>
                    {/* User Info */}
                    {userProfile && (
                      <div className="px-4 py-3 bg-primary-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FaUser className="text-primary-500" />
                          <span className="font-medium">{userProfile.nickname}님</span>
                          {userProfile.provider === 'google' && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                              Google
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Dashboard Link */}
                    {pathname !== '/dashboard' && (
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-center rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        <FaHome />
                        <span>대시보드</span>
                      </Link>
                    )}

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FaSignOutAlt />
                      <span>로그아웃</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg font-medium transition-colors text-center"
                    >
                      로그인
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-center rounded-lg font-medium"
                    >
                      회원가입
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
