import { memo } from 'react';

interface DeckCardProps {
  name: string;
  description?: string;
  cardCount: number;
  dueCount: number;
  onClick?: () => void;
}

/**
 * 덱 카드 컴포넌트
 * React.memo로 최적화되어 props가 변경되지 않으면 리렌더링되지 않습니다.
 */
const DeckCard = memo(function DeckCard({
  name,
  description,
  cardCount,
  dueCount,
  onClick,
}: DeckCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-black hover:shadow-xl hover:from-gray-50 hover:to-white transition-all duration-200 cursor-pointer group shadow-md"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold text-black group-hover:text-gray-700">
          {name}
        </h3>
        {dueCount > 0 && (
          <span className="bg-gradient-to-b from-gray-900 to-black text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            {dueCount}
          </span>
        )}
      </div>

      {description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>{cardCount}개 카드</span>
        {dueCount > 0 && <span>•</span>}
        {dueCount > 0 && <span className="font-medium text-black">{dueCount}개 복습 대기</span>}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수: 모든 props가 동일하면 true 반환 (리렌더링 방지)
  return (
    prevProps.name === nextProps.name &&
    prevProps.description === nextProps.description &&
    prevProps.cardCount === nextProps.cardCount &&
    prevProps.dueCount === nextProps.dueCount &&
    prevProps.onClick === nextProps.onClick
  );
});

export default DeckCard;
