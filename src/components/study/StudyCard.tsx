import { useSpeech } from '../../hooks/useSpeech';

interface StudyCardProps {
  frontText: string;
  backText: string;
  memo?: string;
  isFlipped: boolean;
  isReversed: boolean;
  onFlip: () => void;
}

/**
 * 학습 카드 컴포넌트
 * @param frontText - 카드 앞면 텍스트
 * @param backText - 카드 뒷면 텍스트
 * @param memo - 메모 (선택)
 * @param isFlipped - 카드가 뒤집힌 상태인지 여부
 * @param isReversed - 카드 방향이 역순인지 여부 (뒷면 → 앞면)
 * @param onFlip - 카드를 뒤집을 때 호출되는 함수
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
    <div
      className="bg-gradient-to-br from-white via-gray-50 to-white border-4 border-black rounded-2xl p-12 min-h-[400px] flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl hover:border-gray-800 transition-all duration-300 shadow-lg"
      onClick={onFlip}
    >
      <div className="text-center relative w-full">
        <p className="text-sm text-gray-500 mb-4">
          {isReversed ? '뜻' : '단어/문장'}
        </p>
        <div className="flex items-center justify-center gap-3 mb-8">
          <p className="text-4xl font-bold bg-gradient-to-br from-black to-gray-700 bg-clip-text text-transparent">{frontText}</p>
          {isSupported && (
            <button
              onClick={(e) => handleSpeak(frontText, e)}
              className="text-2xl hover:scale-110 transition-transform"
              aria-label="읽기"
            >
              🔊
            </button>
          )}
        </div>

        {isFlipped ? (
          <>
            <div className="border-t-2 border-gray-300 my-6 w-32 mx-auto" />
            <p className="text-sm text-gray-500 mb-2">
              {isReversed ? '단어/문장' : '뜻'}
            </p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <p className="text-2xl text-gray-700">{backText}</p>
              {isSupported && (
                <button
                  onClick={(e) => handleSpeak(backText, e)}
                  className="text-xl hover:scale-110 transition-transform"
                  aria-label="읽기"
                >
                  🔊
                </button>
              )}
            </div>

            {memo && (
              <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 mb-1">메모</p>
                <p className="text-sm text-gray-600">{memo}</p>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-400 text-sm">
            카드 클릭 또는 스페이스바로 답 확인
          </p>
        )}
      </div>
    </div>
  );
}
