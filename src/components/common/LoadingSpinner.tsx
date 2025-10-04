interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * 로딩 상태를 표시하는 스피너 컴포넌트
 * @param message - 표시할 로딩 메시지 (기본값: '로딩 중...')
 * @param fullScreen - 전체 화면 모드 여부 (기본값: false)
 */
export default function LoadingSpinner({
  message = '로딩 중...',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? 'min-h-screen bg-white flex items-center justify-center'
    : 'flex items-center justify-center py-8';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
