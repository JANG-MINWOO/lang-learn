interface DeckCardProps {
  name: string;
  description?: string;
  cardCount: number;
  dueCount: number;
  onClick?: () => void;
}

export default function DeckCard({
  name,
  description,
  cardCount,
  dueCount,
  onClick,
}: DeckCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-black hover:shadow-lg transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold text-black group-hover:text-gray-700">
          {name}
        </h3>
        {dueCount > 0 && (
          <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
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
}
