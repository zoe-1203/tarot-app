'use client';

import { useState, useCallback, useEffect } from 'react';
import { VISION_MODELS, VisionModelConfig } from '@/lib/vision-models';

// 单张牌的识别结果
interface CardRecognitionResult {
  position: number;
  cardNameCn: string | null;
  cardNameEn: string | null;
  orientation: 'upright' | 'reversed' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
}

interface VisionModelResult {
  modelId: string;
  modelName: string;
  cards: CardRecognitionResult[];
  totalCards: number;
  reason: string;
  rawResponse: string;
  responseTime: number;
  error?: string;
}

interface VisionResponse {
  results: Record<string, VisionModelResult>;
  metadata: {
    totalTime: number;
    timestamp: string;
    filename?: string;
  };
  error?: string;
}

// 单张牌的标注
interface CardLabel {
  position: number;
  cardNameCn: string;
  cardNameEn: string;
  orientation: 'upright' | 'reversed';
}

interface ModelStats {
  modelId: string;
  modelName: string;
  totalImages: number;
  totalCardsExpected: number;
  totalCardsRecognized: number;
  cardCountCorrect: number;
  cardNameCorrect: number;
  orientationCorrect: number;
  combinedCorrect: number;
  cardNameAccuracy: number;
  orientationAccuracy: number;
  combinedAccuracy: number;
  averageTime: number;
  errors: number;
}

interface BatchTestResponse {
  imageResults: Array<{
    filename: string;
    expected?: {
      cards: CardLabel[];
      totalCards: number;
    };
    results: Record<string, VisionModelResult>;
  }>;
  modelStats: Record<string, ModelStats>;
  metadata: {
    totalTime: number;
    timestamp: string;
    totalImages: number;
    hasLabels: boolean;
  };
  error?: string;
}

interface TestDataInfo {
  totalImages: number;
  hasLabels: boolean;
  labeledCount: number;
  images: string[];
}

// 视觉模型选择器
function VisionModelSelector({
  models,
  selected,
  onChange,
}: {
  models: VisionModelConfig[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-3 text-gray-700">
        选择视觉识别模型（可多选）
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {models.map((model) => {
          const isSelected = selected.includes(model.id);
          return (
            <label
              key={model.id}
              className={`
                relative flex items-start p-4 rounded-lg border-2 cursor-pointer
                transition-all
                ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...selected, model.id]);
                  } else {
                    onChange(selected.filter((id) => id !== model.id));
                  }
                }}
                className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <div className="ml-3 flex-1">
                <div className="font-medium text-gray-900">{model.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {model.vendor} · {model.speed}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {model.description}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// 图片上传组件
function ImageUploader({
  onImageSelect,
  selectedImage,
  previewUrl,
}: {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  previewUrl: string | null;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2 text-gray-700">
        上传塔罗牌照片
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files?.[0] && onImageSelect(e.target.files[0])
          }
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          {selectedImage && previewUrl ? (
            <div>
              <img
                src={previewUrl}
                alt="Selected"
                className="max-h-48 mx-auto mb-2 rounded"
              />
              <p className="text-sm text-gray-600">{selectedImage.name}</p>
              <p className="text-xs text-gray-500 mt-1">点击或拖拽更换图片</p>
            </div>
          ) : (
            <div>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                点击或拖拽图片到此处上传
              </p>
              <p className="text-xs text-gray-500">支持 JPG、PNG、WebP、HEIC 格式</p>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}

// 单张牌结果展示组件
function CardResult({ card, index }: { card: CardRecognitionResult; index: number }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-medium text-gray-500">第 {card.position} 张牌</span>
        <span
          className={`
            px-2 py-0.5 rounded text-xs font-medium
            ${
              card.confidence === 'high'
                ? 'bg-green-100 text-green-700'
                : card.confidence === 'medium'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600'
            }
          `}
        >
          {card.confidence === 'high' ? '高' : card.confidence === 'medium' ? '中' : '低'}
        </span>
      </div>
      <div className="font-medium text-gray-900">
        {card.cardNameCn || '未识别'}
        {card.cardNameEn && (
          <span className="text-gray-500 text-sm ml-1">({card.cardNameEn})</span>
        )}
      </div>
      <span
        className={`
          inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium
          ${
            card.orientation === 'upright'
              ? 'bg-emerald-100 text-emerald-700'
              : card.orientation === 'reversed'
              ? 'bg-rose-100 text-rose-700'
              : 'bg-gray-100 text-gray-600'
          }
        `}
      >
        {card.orientation === 'upright' ? '正位' : card.orientation === 'reversed' ? '逆位' : '未知'}
      </span>
    </div>
  );
}

// 识别结果展示
function RecognitionResults({
  results,
  metadata,
}: {
  results: Record<string, VisionModelResult>;
  metadata: { totalTime: number; filename?: string };
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">识别结果</h3>
        <span className="text-sm text-gray-500">
          总耗时: {metadata.totalTime}ms
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(results).map(([modelId, result]) => (
          <div
            key={modelId}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{result.modelName}</h4>
                <span className="text-xs text-gray-500">
                  识别出 {result.totalCards} 张牌
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {result.responseTime}ms
              </span>
            </div>

            {result.error ? (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                {result.error}
              </div>
            ) : (
              <>
                {result.cards.length === 0 ? (
                  <div className="text-gray-500 text-sm">未识别到塔罗牌</div>
                ) : (
                  <div className="space-y-3">
                    {result.cards.map((card, idx) => (
                      <CardResult key={idx} card={card} index={idx} />
                    ))}
                  </div>
                )}

                {result.reason && (
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">识别依据：</span>
                    {result.reason}
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-700">
                    查看原始响应
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-48 whitespace-pre-wrap">
                    {result.rawResponse}
                  </pre>
                </details>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 批量测试面板
function BatchTestPanel({
  selectedModels,
  testInfo,
  onRunBatchTest,
  batchResults,
  isLoading,
  progress,
}: {
  selectedModels: string[];
  testInfo: TestDataInfo | null;
  onRunBatchTest: (limit?: number) => void;
  batchResults: BatchTestResponse | null;
  isLoading: boolean;
  progress: string;
}) {
  const [testLimit, setTestLimit] = useState<number>(5);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">批量测试</h3>

      {testInfo ? (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
          <p className="text-gray-700">
            测试数据：<strong>{testInfo.totalImages}</strong> 张图片
          </p>
          {testInfo.hasLabels && (
            <p className="text-gray-700 mt-1">
              已标注：<strong>{testInfo.labeledCount}</strong> 张
              <span className="text-emerald-600 ml-2">（可计算准确率）</span>
            </p>
          )}
          {!testInfo.hasLabels && (
            <p className="text-amber-600 mt-1 text-xs">
              未找到 labels.json，无法计算准确率
            </p>
          )}
        </div>
      ) : (
        <div className="mb-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
          正在加载测试数据信息...
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          测试图片数量
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            max={testInfo?.totalImages || 49}
            value={testLimit}
            onChange={(e) => setTestLimit(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none text-gray-900"
          />
          <button
            onClick={() => setTestLimit(testInfo?.totalImages || 49)}
            className="px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700"
          >
            全部
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => onRunBatchTest(testLimit)}
          disabled={isLoading || selectedModels.length === 0}
          className="flex-1 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700
                   disabled:bg-indigo-400 text-white font-medium transition-colors"
        >
          {isLoading ? progress || '测试中...' : `测试 ${testLimit} 张图片`}
        </button>
      </div>

      {selectedModels.length === 0 && (
        <p className="text-sm text-amber-600">请先选择至少一个模型</p>
      )}

      {batchResults && (
        <div className="mt-6">
          <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
            <p className="text-blue-800">
              测试完成：{batchResults.metadata.totalImages} 张图片，总耗时{' '}
              {Math.round(batchResults.metadata.totalTime / 1000)}秒
            </p>
          </div>

          <h4 className="font-medium text-gray-900 mb-3">模型对比</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-700">
                    模型
                  </th>
                  <th className="text-center py-2 font-medium text-gray-700">
                    识别/预期牌数
                  </th>
                  {batchResults.metadata.hasLabels && (
                    <>
                      <th className="text-center py-2 font-medium text-gray-700">
                        牌名准确
                      </th>
                      <th className="text-center py-2 font-medium text-gray-700">
                        正逆位准确
                      </th>
                      <th className="text-center py-2 font-medium text-gray-700">
                        综合准确
                      </th>
                    </>
                  )}
                  <th className="text-center py-2 font-medium text-gray-700">
                    平均耗时
                  </th>
                  <th className="text-center py-2 font-medium text-gray-700">
                    错误
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.values(batchResults.modelStats).map((stat) => (
                  <tr key={stat.modelId} className="border-b border-gray-100">
                    <td className="py-2 text-gray-900">{stat.modelName}</td>
                    <td className="text-center py-2">
                      {stat.totalCardsRecognized} / {stat.totalCardsExpected || '-'}
                    </td>
                    {batchResults.metadata.hasLabels && (
                      <>
                        <td className="text-center py-2 text-emerald-600">
                          {stat.cardNameAccuracy}%
                        </td>
                        <td className="text-center py-2 text-blue-600">
                          {stat.orientationAccuracy}%
                        </td>
                        <td className="text-center py-2 font-medium text-indigo-600">
                          {stat.combinedAccuracy}%
                        </td>
                      </>
                    )}
                    <td className="text-center py-2 text-gray-600">
                      {stat.averageTime}ms
                    </td>
                    <td className="text-center py-2 text-rose-600">
                      {stat.errors}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 详细结果折叠 */}
          <details className="mt-4" open>
            <summary className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              查看详细结果 ({batchResults.imageResults.length} 张图片)
            </summary>
            <div className="mt-3 space-y-4">
              {batchResults.imageResults.map((img, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 rounded-lg text-sm border border-gray-200"
                >
                  <div className="flex gap-4">
                    {/* 原图展示 */}
                    <div className="flex-shrink-0">
                      <img
                        src={`/api/vision/image?filename=${encodeURIComponent(img.filename)}`}
                        alt={img.filename}
                        className="w-32 h-40 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="text-xs text-gray-500 mt-1 text-center truncate w-32">
                        {img.filename}
                      </div>
                    </div>

                    {/* 识别结果 */}
                    <div className="flex-1 min-w-0">
                      {/* 预期结果（如有标注） */}
                      {img.expected && (
                        <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
                          <div className="font-medium text-blue-800 mb-1">
                            预期 ({img.expected.totalCards} 张牌)：
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {img.expected.cards.map((card, cardIdx) => (
                              <span key={cardIdx} className="inline-flex items-center gap-1 bg-blue-100 px-2 py-1 rounded">
                                <span className="text-blue-900">#{card.position} {card.cardNameCn}</span>
                                <span className={`px-1 rounded text-xs ${
                                  card.orientation === 'upright'
                                    ? 'bg-emerald-200 text-emerald-800'
                                    : 'bg-rose-200 text-rose-800'
                                }`}>
                                  {card.orientation === 'upright' ? '正' : '逆'}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 各模型识别结果 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.values(img.results).map((r) => (
                          <div
                            key={r.modelId}
                            className="p-3 bg-white rounded-lg border border-gray-200"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-medium text-gray-700">{r.modelName}</span>
                              <span className="text-xs text-gray-500">{r.responseTime}ms</span>
                            </div>
                            {r.error ? (
                              <div className="text-xs text-red-600">{r.error}</div>
                            ) : r.cards.length === 0 ? (
                              <div className="text-xs text-gray-500">未识别到塔罗牌</div>
                            ) : (
                              <div className="space-y-1">
                                {r.cards.map((card, cardIdx) => (
                                  <div key={cardIdx} className="flex items-center gap-2 text-xs">
                                    <span className="text-gray-500">#{card.position}</span>
                                    <span className="font-medium text-gray-900">{card.cardNameCn || '?'}</span>
                                    <span
                                      className={`px-1 rounded ${
                                        card.orientation === 'upright'
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : card.orientation === 'reversed'
                                          ? 'bg-rose-100 text-rose-700'
                                          : 'bg-gray-100 text-gray-600'
                                      }`}
                                    >
                                      {card.orientation === 'upright' ? '正' : card.orientation === 'reversed' ? '逆' : '?'}
                                    </span>
                                    <span
                                      className={`px-1 rounded ${
                                        card.confidence === 'high'
                                          ? 'bg-green-100 text-green-700'
                                          : card.confidence === 'medium'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-gray-100 text-gray-500'
                                      }`}
                                    >
                                      {card.confidence === 'high' ? '高' : card.confidence === 'medium' ? '中' : '低'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

// 主页面
export default function VisionPage() {
  const [selectedModels, setSelectedModels] = useState<string[]>([
    'qwen/qwen-vl-plus',
  ]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [results, setResults] = useState<VisionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 批量测试状态
  const [testInfo, setTestInfo] = useState<TestDataInfo | null>(null);
  const [batchResults, setBatchResults] = useState<BatchTestResponse | null>(
    null
  );
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState('');

  // 加载测试数据信息
  useEffect(() => {
    fetch('/api/vision/batch')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setTestInfo(data);
        }
      })
      .catch(console.error);
  }, []);

  // 处理图片选择（支持 HEIC 自动转换）
  const handleImageSelect = useCallback(async (file: File) => {
    setResults(null);
    setError('');

    // 检查是否为 HEIC 格式
    const isHeic = file.type === 'image/heic' ||
                   file.type === 'image/heif' ||
                   file.name.toLowerCase().endsWith('.heic') ||
                   file.name.toLowerCase().endsWith('.heif');

    if (isHeic) {
      // 首先尝试使用浏览器原生支持（Safari 支持 HEIC）
      const testUrl = URL.createObjectURL(file);
      const img = new Image();

      const canLoadNatively = await new Promise<boolean>((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = testUrl;
      });

      if (canLoadNatively) {
        // 浏览器原生支持 HEIC，使用 Canvas 转换为 JPEG
        setError('正在转换 HEIC 格式...');
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);

          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
              'image/jpeg',
              0.9
            );
          });

          const convertedFile = new File(
            [blob],
            file.name.replace(/\.(heic|heif)$/i, '.jpg'),
            { type: 'image/jpeg' }
          );

          setSelectedImage(convertedFile);
          setPreviewUrl(URL.createObjectURL(convertedFile));
          setError('');
          URL.revokeObjectURL(testUrl);
          return;
        } catch (e) {
          console.error('Canvas conversion failed:', e);
        }
      }

      URL.revokeObjectURL(testUrl);

      // Chrome 等浏览器不支持 HEIC，提示用户转换
      setError('Chrome 浏览器不支持 HEIC 格式。请使用以下方式之一：\n1. 使用 Safari 浏览器上传\n2. 在 iPhone 设置 → 相机 → 格式 → 选择「兼容性最佳」\n3. 用在线工具转换为 JPG 后上传');
      return;
    } else {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  // 单张图片识别
  const handleRecognize = async () => {
    if (!selectedImage || selectedModels.length === 0) {
      setError('请选择图片和至少一个模型');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      // 读取图片为 base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedImage);
      });

      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: selectedImage.type || 'image/jpeg',
          models: selectedModels,
          filename: selectedImage.name,
        }),
      });

      const data: VisionResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API 请求失败');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  // 批量测试
  const handleBatchTest = async (limit?: number) => {
    if (selectedModels.length === 0) {
      setError('请选择至少一个模型');
      return;
    }

    setBatchLoading(true);
    setBatchResults(null);
    setBatchProgress('准备测试...');

    try {
      const response = await fetch('/api/vision/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          models: selectedModels,
          limit,
        }),
      });

      const data: BatchTestResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '批量测试失败');
      }

      setBatchResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '批量测试错误');
    } finally {
      setBatchLoading(false);
      setBatchProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tarot Card Vision
          </h1>
          <p className="text-gray-600">AI-Powered Tarot Card Recognition</p>
          <a
            href="/"
            className="inline-block mt-2 text-sm text-indigo-600 hover:text-indigo-700"
          >
            ← 返回塔罗解读
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 左侧：单张识别 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              单张识别
            </h2>

            <ImageUploader
              onImageSelect={handleImageSelect}
              selectedImage={selectedImage}
              previewUrl={previewUrl}
            />

            <VisionModelSelector
              models={VISION_MODELS}
              selected={selectedModels}
              onChange={setSelectedModels}
            />

            <button
              onClick={handleRecognize}
              disabled={
                loading || !selectedImage || selectedModels.length === 0
              }
              className="w-full py-4 rounded-lg bg-indigo-600 hover:bg-indigo-700
                       disabled:bg-indigo-400 text-white font-medium transition-colors"
            >
              {loading ? '识别中...' : '开始识别'}
            </button>

            {error && (
              <p className="mt-4 text-red-600 text-center text-sm">{error}</p>
            )}
          </div>

          {/* 右侧：批量测试 */}
          <BatchTestPanel
            selectedModels={selectedModels}
            testInfo={testInfo}
            onRunBatchTest={handleBatchTest}
            batchResults={batchResults}
            isLoading={batchLoading}
            progress={batchProgress}
          />
        </div>

        {/* 识别结果展示 */}
        {results && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <RecognitionResults
              results={results.results}
              metadata={results.metadata}
            />
          </div>
        )}
      </main>
    </div>
  );
}
