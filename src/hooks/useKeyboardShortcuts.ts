import { useEffect } from 'react';

type ShortcutHandler = () => void;

interface Shortcuts {
  [key: string]: ShortcutHandler;
}

/**
 * 키보드 단축키를 등록하는 커스텀 훅
 * @param shortcuts - 키와 핸들러 맵핑 객체 (예: { ' ': handleFlip, '1': handleAgain })
 * @param enabled - 단축키 활성화 여부 (기본값: true)
 */
export function useKeyboardShortcuts(
  shortcuts: Shortcuts,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Space 키의 경우 key와 code 모두 처리
      const pressedKey = e.key === ' ' || e.code === 'Space' ? ' ' : e.key;

      if (shortcuts[pressedKey]) {
        e.preventDefault();
        shortcuts[pressedKey]();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts, enabled]);
}
