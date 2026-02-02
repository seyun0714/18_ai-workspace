'use client';

import { useEffect, useState } from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';

export default function STT_Hook() {
  const [userText, setUserText] = useState('');
  const [hasSTTSupport, setHasSTTSupport] = useState(false);

  const {
    transcript,
    finalTranscript,
    interimTranscript,
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    if (browserSupportsSpeechRecognition) {
      setHasSTTSupport(true);
    }
    // 음성 인식 객체 생성 + 속성 설정 + 이벤트핸들러 바인딩 할 필요 없음
  }, []);

  useEffect(() => {
    if (finalTranscript) {
      setUserText((prev) => prev + finalTranscript);
      resetTranscript();
    }
  }, [finalTranscript]);

  const handleStartListening = () => {
    if (!hasSTTSupport) return;

    try {
      SpeechRecognition.startListening({
        language: 'ko-KR',
        continuous: false,
        interimResults: false,
      });
    } catch (error) {}
  };

  const handleStopListening = () => {
    try {
      SpeechRecognition.stopListening();
    } catch (error) {}
  };

  return (
    <section className="flex flex-col rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="mb-5 bg-zinc-50 text-xs text-zinc-700 flex justify-between">
        <span className="font-semibold">브라우저 지원 상태 - STT </span>{' '}
        {browserSupportsSpeechRecognition ? (
          <span className="text-emerald-700">지원됨 ✅</span>
        ) : (
          <span className="text-red-600">미지원 ⚠️</span>
        )}
      </div>

      <h2 className="mb-2 text-sm font-semibold text-zinc-900">
        STT - React Hook (useSpeechRecognition) 활용
      </h2>
      <p className="mb-3 text-xs text-zinc-600">
        마이크 버튼을 누르고 말해보세요. <code>useSpeechRecognition</code>{' '}
        훅에서 반환하는
        <code>transcript</code>와 <code>finalTranscript</code> 상태를 통해 인식
        결과를 실시간으로 처리합니다.
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleStartListening}
          disabled={!hasSTTSupport || listening}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-white transition ${
            !hasSTTSupport || listening
              ? 'cursor-not-allowed bg-zinc-400'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          <span>🎤 음성 입력 시작</span>
        </button>
        <button
          type="button"
          onClick={handleStopListening}
          disabled={!listening}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition ${
            !listening
              ? 'cursor-not-allowed border border-zinc-200 bg-white text-zinc-400'
              : 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          ⏹️ 음성 입력 종료
        </button>
        <span className="inline-flex items-center text-xs text-zinc-500">
          상태:{' '}
          <span
            className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
              listening
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-zinc-100 text-zinc-500'
            }`}
          >
            {listening ? 'LISTENING...' : 'IDLE'}
          </span>
        </span>
      </div>

      <label className="mb-1 text-xs font-medium text-zinc-700">
        사용자가 말한 내용 (텍스트 입력창)
      </label>
      <textarea
        className="min-h-30 w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        placeholder="마이크 버튼을 누르고 말해 보세요."
        value={userText}
        onChange={(e) => setUserText(e.target.value)}
      />
    </section>
  );
}
