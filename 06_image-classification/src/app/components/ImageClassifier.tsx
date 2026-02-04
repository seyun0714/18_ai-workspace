'use client';

import { useState, useRef, useEffect } from 'react';
import '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { div } from '@tensorflow/tfjs';

interface Prediction {
  className: string;
  probability: number;
}

export default function ImageClassifier() {
  // 모델 로딩 여부
  const [modelLoading, setModelLoading] = useState(true);
  // 모델 로딩 진행 퍼센트
  const [progress, setProgress] = useState(0);
  // 모델 로딩 진행 상태 메시지
  const [progressLabel, setProgressLabel] = useState('모델 준비 중…');

  // 이미지 미리보기 경로 (Base64 URL)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // 이미지를 표시할 <img> 엘리먼트, 분류시에도 필요 (Ref 사용)
  const imgRef = useRef<HTMLImageElement>(null);

  // 분류 중 여부
  const [classifying, setClassifying] = useState(false);
  // 분류 결과
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  // 에러 메시지
  const [error, setError] = useState<string | null>(null);

  const modelRef = useRef<mobilenet.MobileNet>(null);

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    setModelLoading(true);
    setProgressLabel('모델 로딩 중...');

    try {
      const model = await mobilenet.load();
      modelRef.current = model;
    } catch (error) {
      setError(error instanceof Error ? error.message : '모델 로딩 실패');
    } finally {
      setModelLoading(false);
    }
  };

  const handleImageUpload = (
    inputEvent: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = inputEvent.target.files?.[0];
    if (!file) {
      setSelectedImage(null);
      setPredictions([]);
      return;
    }
    setError('');

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      // 파일 읽기가 완료되었을 때 실행되는 이벤트 핸들러
      setSelectedImage(readerEvent.target?.result as string);
      setPredictions([]);
    };

    reader.readAsDataURL(file);
  };

  const classifyImage = async () => {
    const model = modelRef.current;
    const imgElem = imgRef.current;
    if (!imgElem || !model) {
      setError('모델 또는 이미지가 준비되어있지 않습ㄴ디ㅏ.');
      return;
    }
    setClassifying(true);
    try {
      const predictions = await model.classify(imgElem);
      setPredictions(predictions);
    } catch (error) {
      setError(error instanceof Error ? error.message : '분류 실패');
    } finally {
      setClassifying(false);
    }
  };

  if (error && !modelLoading) {
    return (
      <div className="w-full max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
        <p className="font-medium">오류</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="mb-2 text-lg font-semibold text-zinc-800 dark:text-zinc-100">
        이미지 분류 (Image Classification)
      </h2>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        TensorFlow.js · MobileNet (브라우저에서 실행, 이미지 → 텐서 → 추론)
      </p>

      {modelLoading && (
        <div className="flex w-full justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {!modelLoading && (
        <>
          <div className="mb-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-sm text-zinc-700 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-4 file:py-2 file:text-emerald-700 dark:text-zinc-300 dark:file:bg-emerald-900/50 dark:file:text-emerald-300"
            />
          </div>

          {selectedImage && (
            <div className="mb-4 flex flex-col gap-3">
              <img
                ref={imgRef}
                src={selectedImage}
                alt="분류할 이미지"
                className="max-h-64 w-auto rounded-lg border border-zinc-200 object-contain dark:border-zinc-600"
              />
              <button
                type="button"
                onClick={classifyImage}
                disabled={classifying}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                {classifying ? '분류 중…' : 'model.classify(img) 실행'}
              </button>
            </div>
          )}

          {(classifying || predictions.length > 0) && (
            <div className="mb-4 min-h-12 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800/50">
              {classifying && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  분류 중…
                </p>
              )}
              {!classifying && predictions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    상위 3개 예측
                  </p>
                  <ul className="space-y-1.5">
                    {predictions.map((p, i) => (
                      <li
                        key={i}
                        className="flex justify-between text-sm text-zinc-800 dark:text-zinc-200"
                      >
                        <span>{p.className}</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {(p.probability * 100).toFixed(1)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
              💡 실제 서비스 활용
            </p>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
              자동 태깅, 접근성(대체 텍스트), 상품 카테고리 추천, 콘텐츠
              모더레이션 등에 분류 결과를 연결할 수 있습니다.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
