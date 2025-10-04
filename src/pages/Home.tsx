import { useState } from 'react';
import Button from '../components/Button';
import DeckCard from '../components/DeckCard';

export default function Home() {
  // 임시 데모 데이터
  const [decks] = useState([
    {
      id: '1',
      name: '일상 영어 회화',
      description: '매일 사용하는 기본 영어 표현 모음',
      cardCount: 45,
      dueCount: 12,
    },
    {
      id: '2',
      name: 'JLPT N2 단어',
      description: '일본어 능력시험 N2 레벨 필수 단어',
      cardCount: 120,
      dueCount: 28,
    },
    {
      id: '3',
      name: '스페인어 기초',
      description: '스페인어 초급 문법과 단어',
      cardCount: 67,
      dueCount: 0,
    },
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-1">Language Learning</h1>
              <p className="text-gray-600 text-sm">간격 반복 학습으로 언어를 마스터하세요</p>
            </div>
            <Button variant="primary" size="lg">
              + 새 덱 만들기
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <p className="text-gray-600 text-sm mb-1">전체 덱</p>
            <p className="text-4xl font-bold text-black">{decks.length}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <p className="text-gray-600 text-sm mb-1">전체 카드</p>
            <p className="text-4xl font-bold text-black">
              {decks.reduce((sum, deck) => sum + deck.cardCount, 0)}
            </p>
          </div>
          <div className="bg-black text-white rounded-xl p-6">
            <p className="text-gray-300 text-sm mb-1">오늘 복습할 카드</p>
            <p className="text-4xl font-bold">
              {decks.reduce((sum, deck) => sum + deck.dueCount, 0)}
            </p>
          </div>
        </div>

        {/* Deck List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-6">내 덱</h2>

          {decks.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
              <p className="text-gray-500 text-lg mb-4">아직 덱이 없습니다</p>
              <Button variant="outline">+ 첫 번째 덱 만들기</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  name={deck.name}
                  description={deck.description}
                  cardCount={deck.cardCount}
                  dueCount={deck.dueCount}
                  onClick={() => console.log('Deck clicked:', deck.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
