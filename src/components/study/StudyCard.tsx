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
  return (
    <div
      className="bg-white border-4 border-black rounded-2xl p-12 min-h-[400px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onFlip}
    >
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-4">
          {isReversed ? '뜻' : '단어/문장'}
        </p>
        <p className="text-4xl font-bold text-black mb-8">{frontText}</p>

        {isFlipped ? (
          <>
            <div className="border-t-2 border-gray-300 my-6 w-32 mx-auto" />
            <p className="text-sm text-gray-500 mb-2">
              {isReversed ? '단어/문장' : '뜻'}
            </p>
            <p className="text-2xl text-gray-700 mb-4">{backText}</p>

            {memo && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
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
