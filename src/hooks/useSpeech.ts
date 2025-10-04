import { useCallback, useRef, useState } from 'react';
import axios from 'axios';

/**
 * 텍스트에서 언어 자동 감지
 * @param text - 감지할 텍스트
 * @returns 언어 코드 (ko-KR, ja-JP, zh-CN, en-US, es-ES, de-DE, vi-VN 등)
 */
export function detectLanguage(text: string): string {
  // 한국어 감지
  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)) {
    return 'ko-KR';
  }

  // 일본어 감지 (히라가나, 가타카나)
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
    return 'ja-JP';
  }

  // 중국어 감지 (간체/번체)
  if (/[\u4E00-\u9FFF]/.test(text)) {
    return 'zh-CN';
  }

  // 스페인어 특수 문자 감지 (¿¡áéíóúüñÁÉÍÓÚÜÑ)
  if (/[¿¡áéíóúüñÁÉÍÓÚÜÑ]/.test(text)) {
    return 'es-ES';
  }

  // 독일어 특수 문자 감지 (äöüßÄÖÜ)
  if (/[äöüßÄÖÜ]/.test(text)) {
    return 'de-DE';
  }

  // 베트남어 특수 문자 감지 (ăâêôơưđĂÂÊÔƠƯĐ và 성조 기호)
  if (/[ăâêôơưđĂÂÊÔƠƯĐàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/.test(text)) {
    return 'vi-VN';
  }

  // 기본값: 영어
  return 'en-US';
}

/**
 * Google Cloud Text-to-Speech API를 사용한 TTS 커스텀 훅
 * @returns speak 함수와 stop 함수
 */
export function useSpeech() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 텍스트를 음성으로 읽기 (Google Cloud TTS)
   * @param text - 읽을 텍스트
   */
  const speak = useCallback(async (text: string) => {
    try {
      setIsLoading(true);

      // 이전 오디오 중지
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_TTS_API_KEY;
      if (!apiKey) {
        console.warn('Google Cloud TTS API key is not configured. Falling back to Web Speech API.');
        // Fallback to Web Speech API
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = detectLanguage(text);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        setIsLoading(false);
        return;
      }

      // 언어 자동 감지
      const detectedLang = detectLanguage(text);

      // Google Cloud TTS 언어 코드 매핑
      const languageCodeMap: { [key: string]: { languageCode: string; name: string } } = {
        'ko-KR': { languageCode: 'ko-KR', name: 'ko-KR-Neural2-A' },
        'ja-JP': { languageCode: 'ja-JP', name: 'ja-JP-Neural2-B' },
        'zh-CN': { languageCode: 'cmn-CN', name: 'cmn-CN-Wavenet-A' },
        'en-US': { languageCode: 'en-US', name: 'en-US-Neural2-F' },
        'es-ES': { languageCode: 'es-ES', name: 'es-ES-Neural2-A' },
        'de-DE': { languageCode: 'de-DE', name: 'de-DE-Neural2-F' },
        'vi-VN': { languageCode: 'vi-VN', name: 'vi-VN-Neural2-A' },
      };

      const voiceConfig = languageCodeMap[detectedLang] || languageCodeMap['en-US'];

      // Google Cloud TTS API 호출
      const response = await axios.post(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          input: { text },
          voice: {
            languageCode: voiceConfig.languageCode,
            name: voiceConfig.name,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.95,
            pitch: 0,
          },
        }
      );

      // Base64 오디오 데이터를 재생
      const audioContent = response.data.audioContent;
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      audioRef.current = audio;

      await audio.play();
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to synthesize speech:', error);
      setIsLoading(false);

      // 에러 발생 시 Web Speech API로 폴백
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = detectLanguage(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  /**
   * 현재 재생 중인 음성 중지
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const isSupported = true; // 항상 true (폴백 포함)

  return { speak, stop, isSupported, isLoading, detectLanguage };
}
