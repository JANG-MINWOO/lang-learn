import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Deck } from '../types';
import Button from '../components/Button';
import DeckCard from '../components/DeckCard';
import Modal from '../components/Modal';
import Input from '../components/Input';

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeck, setNewDeck] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  // Firestore에서 덱 목록 실시간 구독
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'decks'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const deckData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Deck[];

      setDecks(deckData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDeck.name.trim() || !currentUser) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'decks'), {
        userId: currentUser.uid,
        name: newDeck.name,
        description: newDeck.description,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      setNewDeck({ name: '', description: '' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating deck:', error);
      alert('덱 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-1">Language Learning</h1>
              <p className="text-gray-600 text-sm">
                {userProfile?.nickname}님, 간격 반복 학습으로 언어를 마스터하세요
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" size="lg" onClick={() => setIsModalOpen(true)}>
                + 새 덱 만들기
              </Button>
              <Button variant="ghost" size="lg" onClick={handleLogout}>
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Deck List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-6">내 덱</h2>

          {decks.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
              <p className="text-gray-500 text-lg mb-4">아직 덱이 없습니다</p>
              <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                + 첫 번째 덱 만들기
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  name={deck.name}
                  description={deck.description}
                  cardCount={0}
                  dueCount={0}
                  onClick={() => navigate(`/deck/${deck.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Deck Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="새 덱 만들기"
      >
        <form onSubmit={handleCreateDeck} className="space-y-4">
          <Input
            label="덱 이름"
            placeholder="예: 일상 영어 회화"
            value={newDeck.name}
            onChange={(e) => setNewDeck({ ...newDeck, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명 (선택)
            </label>
            <textarea
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
              rows={3}
              placeholder="덱에 대한 간단한 설명을 입력하세요"
              value={newDeck.description}
              onChange={(e) => setNewDeck({ ...newDeck, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading || !newDeck.name.trim()}
            >
              {loading ? '생성 중...' : '만들기'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
