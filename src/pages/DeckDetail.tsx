import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Deck, Card } from '../types';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { getDeck } from '../services/deckService';
import { createCard, updateCard, deleteCard } from '../services/cardService';
import { useToast } from '../contexts/ToastContext';
import { processError } from '../utils/errorHandler';
import { useCards } from '../hooks/useCards';
import { useForm } from '../hooks/useForm';

export default function DeckDetail() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { cards } = useCards(deckId);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, validate, reset, setValues } = useForm(
    { front: '', back: '', memo: '' },
    {
      front: (value) => (!value || !value.trim() ? '앞면을 입력해주세요' : undefined),
      back: (value) => (!value || !value.trim() ? '뒷면을 입력해주세요' : undefined),
    }
  );

  // 덱 정보 가져오기
  useEffect(() => {
    if (!deckId) return;

    const fetchDeck = async () => {
      const deckData = await getDeck(deckId);
      if (deckData) {
        setDeck(deckData);
      }
    };

    fetchDeck();
  }, [deckId]);

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !deckId) return;

    setLoading(true);
    try {
      await createCard(deckId, {
        front: values.front,
        back: values.back,
        memo: values.memo,
      });

      reset();
      setIsModalOpen(false);
      showToast('카드가 추가되었습니다', 'success');
    } catch (error) {
      const errorMessage = processError(error, 'CreateCard');
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCard || !validate()) return;

    setLoading(true);
    try {
      await updateCard(editingCard.id, {
        front: values.front,
        back: values.back,
        memo: values.memo,
      });

      reset();
      setEditingCard(null);
      setIsModalOpen(false);
      showToast('카드가 수정되었습니다', 'success');
    } catch (error) {
      const errorMessage = processError(error, 'UpdateCard');
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('정말 이 카드를 삭제하시겠습니까?')) return;

    try {
      await deleteCard(cardId);
      showToast('카드가 삭제되었습니다', 'success');
    } catch (error) {
      const errorMessage = processError(error, 'DeleteCard');
      showToast(errorMessage, 'error');
    }
  };

  const openEditModal = (card: Card) => {
    setEditingCard(card);
    setValues({
      front: card.front,
      back: card.back,
      memo: card.memo,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCard(null);
    reset();
  };

  if (!deck) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            ← 뒤로 가기
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-1">{deck.name}</h1>
              {deck.description && (
                <p className="text-gray-600 text-sm">{deck.description}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(`/study/${deckId}`)}
                disabled={cards.length === 0}
              >
                학습 시작
              </Button>
              <Button variant="outline" size="lg" onClick={() => setIsModalOpen(true)}>
                + 카드 추가
              </Button>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
              <span className="text-gray-600 text-sm">전체 카드: </span>
              <span className="font-bold text-black">{cards.length}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {cards.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-500 text-lg mb-4">아직 카드가 없습니다</p>
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              + 첫 번째 카드 추가
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-black transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">앞면 (공부할 내용)</p>
                    <p className="text-lg font-bold text-black">{card.front}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">뒷면 (뜻)</p>
                    <p className="text-base text-gray-700">{card.back}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">메모</p>
                    <p className="text-sm text-gray-600">{card.memo || '메모 없음'}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(card)}>
                    수정
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Card Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCard ? '카드 수정' : '새 카드 추가'}
      >
        <form onSubmit={editingCard ? handleUpdateCard : handleCreateCard} className="space-y-4">
          <Input
            label="앞면 (공부할 단어/문장)"
            placeholder="예: Hello"
            value={values.front}
            onChange={handleChange('front')}
            error={errors.front}
            required
          />

          <Input
            label="뒷면 (뜻)"
            placeholder="예: 안녕하세요"
            value={values.back}
            onChange={handleChange('back')}
            error={errors.back}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메모 (선택)
            </label>
            <textarea
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
              rows={3}
              placeholder="문법, 발음, 예문 등을 입력하세요"
              value={values.memo}
              onChange={handleChange('memo')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" className="flex-1" onClick={closeModal}>
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading || !values.front.trim() || !values.back.trim()}
            >
              {loading ? '처리 중...' : editingCard ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
