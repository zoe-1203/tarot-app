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

// 多图片上传的单张图片状态
interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'uploaded' | 'pending' | 'processing' | 'done' | 'error';
  results?: VisionResponse;
  error?: string;
}

const MAX_IMAGES = 10;

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

// 多图片上传组件
function MultiImageUploader({
  images,
  onImagesAdd,
  onImageRemove,
  onClearAll,
  maxImages = MAX_IMAGES,
}: {
  images: ImageItem[];
  onImagesAdd: (files: File[]) => void;
  onImageRemove: (id: string) => void;
  onClearAll: () => void;
  maxImages?: number;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (files.length > 0) {
        onImagesAdd(files);
      }
    },
    [onImagesAdd]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        onImagesAdd(files);
        e.target.value = ''; // 清空 input 以便再次选择相同文件
      }
    },
    [onImagesAdd]
  );

  const getStatusIcon = (status: ImageItem['status']) => {
    switch (status) {
      case 'done':
        return <span className="text-emerald-500">✓</span>;
      case 'processing':
        return <span className="text-blue-500 animate-spin">◌</span>;
      case 'error':
        return <span className="text-red-500">✕</span>;
      case 'pending':
        return <span className="text-amber-500">◌</span>;
      default: // uploaded
        return <span className="text-gray-400">✓</span>;
    }
  };

  const getStatusText = (status: ImageItem['status']) => {
    switch (status) {
      case 'done':
        return '完成';
      case 'processing':
        return '识别中...';
      case 'error':
        return '失败';
      case 'pending':
        return '等待识别中';
      default: // uploaded
        return '已上传';
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          上传塔罗牌照片（最多 {maxImages} 张）
        </label>
        {images.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-red-600 hover:text-red-700"
          >
            清空全部
          </button>
        )}
      </div>

      {/* 已选择的图片网格 */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-4">
          {images.map((img) => (
            <div
              key={img.id}
              className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 ${
                img.status === 'processing'
                  ? 'border-blue-400'
                  : img.status === 'done'
                  ? 'border-emerald-400'
                  : img.status === 'error'
                  ? 'border-red-400'
                  : 'border-gray-200'
              }`}
            >
              <img
                src={img.previewUrl}
                alt={img.file.name}
                className="w-full h-full object-cover"
              />
              {/* 状态覆盖层 */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl">{getStatusIcon(img.status)}</div>
                  <div className="text-xs text-white mt-1">{getStatusText(img.status)}</div>
                </div>
              </div>
              {/* 删除按钮 */}
              {img.status !== 'processing' && (
                <button
                  onClick={() => onImageRemove(img.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600
                           text-white rounded-full text-xs flex items-center justify-center"
                >
                  ×
                </button>
              )}
              {/* 文件名 */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                <p className="text-xs text-white truncate">{img.file.name}</p>
              </div>
            </div>
          ))}

          {/* 添加更多按钮 */}
          {images.length < maxImages && (
            <label
              htmlFor="multi-image-upload"
              className="aspect-[3/4] rounded-lg border-2 border-dashed border-gray-300
                       hover:border-gray-400 cursor-pointer flex items-center justify-center
                       bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl text-gray-400">+</div>
                <div className="text-xs text-gray-500">添加</div>
              </div>
            </label>
          )}
        </div>
      )}

      {/* 上传区域 */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors
          ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400'
          }
          ${images.length >= maxImages ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="multi-image-upload"
          disabled={images.length >= maxImages}
        />
        <label
          htmlFor="multi-image-upload"
          className={`cursor-pointer ${images.length >= maxImages ? 'cursor-not-allowed' : ''}`}
        >
          <svg
            className="mx-auto h-10 w-10 text-gray-400"
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
            {images.length === 0
              ? '点击或拖拽图片到此处上传（支持多选）'
              : images.length >= maxImages
              ? `已达到最大数量 ${maxImages} 张`
              : `已选择 ${images.length} 张，可继续添加`}
          </p>
          <p className="text-xs text-gray-500">支持 JPG、PNG、WebP、HEIC 格式</p>
        </label>
      </div>

      {/* 进度统计 */}
      {images.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          {(() => {
            const done = images.filter(i => i.status === 'done').length;
            const errors = images.filter(i => i.status === 'error').length;
            const processing = images.filter(i => i.status === 'processing').length;
            if (processing > 0) {
              return `正在识别: ${done}/${images.length} 完成`;
            }
            if (done === images.length) {
              return `全部完成: ${done} 张`;
            }
            if (errors > 0) {
              return `完成 ${done} 张，失败 ${errors} 张`;
            }
            return `已选择 ${images.length} 张图片`;
          })()}
        </div>
      )}
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">批量测试（暂不可用，别用）</h3>

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

// 生成唯一 ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// File 转 base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 图片压缩（解决 Vercel 请求体大小限制）
async function compressImage(file: File, maxSizeMB: number = 3): Promise<File> {
  // 如果文件已经足够小，直接返回
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('无法创建 canvas context'));
        return;
      }

      // 计算压缩后的尺寸
      let { naturalWidth: width, naturalHeight: height } = img;
      const maxDimension = 2048; // 最大边长

      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // 递归尝试不同质量压缩
      let quality = 0.8;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('压缩失败'));
              return;
            }

            // 如果仍然太大且质量可以继续降低
            if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.3) {
              quality -= 0.1;
              tryCompress();
            } else {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, '.jpg'),
                { type: 'image/jpeg' }
              );
              console.log(`图片压缩: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB (质量: ${(quality * 100).toFixed(0)}%)`);
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          quality
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('图片加载失败'));
    };

    img.src = objectUrl;
  });
}

// 主页面
export default function VisionPage() {
  const [selectedModels, setSelectedModels] = useState<string[]>([
    'qwen/qwen-vl-plus',
  ]);

  // 多图片状态
  const [images, setImages] = useState<ImageItem[]>([]);
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

  // 处理 HEIC 转换
  const convertHeicToJpeg = useCallback(async (file: File): Promise<File | null> => {
    const testUrl = URL.createObjectURL(file);
    const img = new Image();

    const canLoadNatively = await new Promise<boolean>((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = testUrl;
    });

    if (canLoadNatively) {
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

        URL.revokeObjectURL(testUrl);
        return convertedFile;
      } catch (e) {
        console.error('Canvas conversion failed:', e);
      }
    }

    URL.revokeObjectURL(testUrl);
    return null;
  }, []);

  // 添加图片
  const handleImagesAdd = useCallback(async (files: File[]) => {
    setError('');

    // 检查数量限制
    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setError(`最多只能上传 ${MAX_IMAGES} 张图片`);
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setError(`已选择 ${filesToAdd.length} 张，超出部分已忽略`);
    }

    const newImages: ImageItem[] = [];

    for (const file of filesToAdd) {
      // 检查是否为 HEIC 格式
      const isHeic = file.type === 'image/heic' ||
                     file.type === 'image/heif' ||
                     file.name.toLowerCase().endsWith('.heic') ||
                     file.name.toLowerCase().endsWith('.heif');

      let finalFile = file;

      if (isHeic) {
        const converted = await convertHeicToJpeg(file);
        if (converted) {
          finalFile = converted;
        } else {
          // 无法转换 HEIC，跳过这个文件
          setError(prev => prev ? `${prev}\n${file.name}: HEIC 转换失败` : `${file.name}: HEIC 转换失败`);
          continue;
        }
      }

      // 压缩大图片（避免超过 Vercel 请求体大小限制）
      try {
        finalFile = await compressImage(finalFile, 3);
      } catch (e) {
        console.warn('图片压缩失败，使用原图:', e);
      }

      newImages.push({
        id: generateId(),
        file: finalFile,
        previewUrl: URL.createObjectURL(finalFile),
        status: 'uploaded',
      });
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
    }
  }, [images.length, convertHeicToJpeg]);

  // 删除单张图片
  const handleImageRemove = useCallback((id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) {
        URL.revokeObjectURL(img.previewUrl);
      }
      return prev.filter(i => i.id !== id);
    });
  }, []);

  // 清空所有图片
  const handleClearAll = useCallback(() => {
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setError('');
  }, [images]);

  // 多图片识别（逐张处理）
  const handleRecognize = async () => {
    if (images.length === 0 || selectedModels.length === 0) {
      setError('请选择图片和至少一个模型');
      return;
    }

    setLoading(true);
    setError('');

    // 将 uploaded 状态改为 pending（等待识别中）
    setImages(prev => prev.map(img =>
      img.status === 'uploaded' || img.status === 'error'
        ? { ...img, status: 'pending' as const, error: undefined }
        : img
    ));

    // 逐张处理
    for (let i = 0; i < images.length; i++) {
      const image = images[i];

      // 跳过已完成的
      if (image.status === 'done') continue;

      // 更新状态为 processing
      setImages(prev => prev.map((img, idx) =>
        idx === i ? { ...img, status: 'processing' as const } : img
      ));

      try {
        const base64 = await fileToBase64(image.file);

        const response = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: image.file.type || 'image/jpeg',
            models: selectedModels,
            filename: image.file.name,
          }),
        });

        const data: VisionResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'API 请求失败');
        }

        // 更新状态为 done，保存结果
        setImages(prev => prev.map((img, idx) =>
          idx === i ? { ...img, status: 'done' as const, results: data } : img
        ));
      } catch (err) {
        // 更新状态为 error
        const errorMsg = err instanceof Error ? err.message : '未知错误';
        setImages(prev => prev.map((img, idx) =>
          idx === i ? { ...img, status: 'error' as const, error: errorMsg } : img
        ));
      }
    }

    setLoading(false);
  };

  // 重试失败的图片
  const handleRetryFailed = async () => {
    const failedImages = images.filter(img => img.status === 'error');
    if (failedImages.length === 0) return;

    setLoading(true);
    setError('');

    for (const image of failedImages) {
      const idx = images.findIndex(img => img.id === image.id);
      if (idx === -1) continue;

      // 更新状态为 processing
      setImages(prev => prev.map((img) =>
        img.id === image.id ? { ...img, status: 'processing' as const, error: undefined } : img
      ));

      try {
        const base64 = await fileToBase64(image.file);

        const response = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: image.file.type || 'image/jpeg',
            models: selectedModels,
            filename: image.file.name,
          }),
        });

        const data: VisionResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'API 请求失败');
        }

        setImages(prev => prev.map((img) =>
          img.id === image.id ? { ...img, status: 'done' as const, results: data } : img
        ));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '未知错误';
        setImages(prev => prev.map((img) =>
          img.id === image.id ? { ...img, status: 'error' as const, error: errorMsg } : img
        ));
      }
    }

    setLoading(false);
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
          {/* 左侧：多图片识别 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              图片识别
            </h2>

            <MultiImageUploader
              images={images}
              onImagesAdd={handleImagesAdd}
              onImageRemove={handleImageRemove}
              onClearAll={handleClearAll}
            />

            <VisionModelSelector
              models={VISION_MODELS}
              selected={selectedModels}
              onChange={setSelectedModels}
            />

            <div className="flex gap-3">
              <button
                onClick={handleRecognize}
                disabled={loading || images.length === 0 || selectedModels.length === 0}
                className="flex-1 py-4 rounded-lg bg-indigo-600 hover:bg-indigo-700
                         disabled:bg-indigo-400 text-white font-medium transition-colors"
              >
                {loading
                  ? `识别中 (${images.filter(i => i.status === 'done').length}/${images.length})`
                  : `开始识别 ${images.length > 0 ? `(${images.length} 张)` : ''}`}
              </button>

              {/* 重试失败按钮 */}
              {images.some(i => i.status === 'error') && !loading && (
                <button
                  onClick={handleRetryFailed}
                  className="px-4 py-4 rounded-lg bg-amber-500 hover:bg-amber-600
                           text-white font-medium transition-colors"
                >
                  重试失败
                </button>
              )}
            </div>

            {error && (
              <p className="mt-4 text-red-600 text-center text-sm whitespace-pre-line">{error}</p>
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

        {/* 多图片识别结果展示 */}
        {images.some(img => img.status === 'done' || img.status === 'error') && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                识别结果 ({images.filter(i => i.status === 'done').length}/{images.length} 张完成)
              </h3>
            </div>

            <div className="space-y-6">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={`p-4 rounded-xl border-2 ${
                    img.status === 'done'
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : img.status === 'error'
                      ? 'border-red-200 bg-red-50/30'
                      : img.status === 'processing'
                      ? 'border-blue-200 bg-blue-50/30'
                      : img.status === 'pending'
                      ? 'border-amber-200 bg-amber-50/30'
                      : 'border-gray-200 bg-gray-50/30'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* 图片缩略图 */}
                    <div className="flex-shrink-0">
                      <img
                        src={img.previewUrl}
                        alt={img.file.name}
                        className="w-24 h-32 object-cover rounded-lg border border-gray-300"
                      />
                    </div>

                    {/* 识别信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900 truncate">
                          {img.file.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            img.status === 'done'
                              ? 'bg-emerald-100 text-emerald-700'
                              : img.status === 'error'
                              ? 'bg-red-100 text-red-700'
                              : img.status === 'processing'
                              ? 'bg-blue-100 text-blue-700'
                              : img.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {img.status === 'done'
                            ? '完成'
                            : img.status === 'error'
                            ? '失败'
                            : img.status === 'processing'
                            ? '识别中...'
                            : img.status === 'pending'
                            ? '等待识别中'
                            : '已上传'}
                        </span>
                      </div>

                      {/* 错误信息 */}
                      {img.status === 'error' && img.error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded mb-2">
                          {img.error}
                        </div>
                      )}

                      {/* 识别结果 */}
                      {img.status === 'done' && img.results && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.values(img.results.results).map((result) => (
                            <div
                              key={result.modelId}
                              className="p-3 bg-white rounded-lg border border-gray-200"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                  {result.modelName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {result.responseTime}ms
                                </span>
                              </div>

                              {result.error ? (
                                <div className="text-xs text-red-600">{result.error}</div>
                              ) : result.cards.length === 0 ? (
                                <div className="text-xs text-gray-500">未识别到塔罗牌</div>
                              ) : (
                                <div className="space-y-1">
                                  {result.cards.map((card, cardIdx) => (
                                    <div key={cardIdx} className="flex items-center gap-2 text-sm">
                                      <span className="text-gray-500">#{card.position}</span>
                                      <span className="font-medium text-gray-900">
                                        {card.cardNameCn || '?'}
                                      </span>
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-xs ${
                                          card.orientation === 'upright'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : card.orientation === 'reversed'
                                            ? 'bg-rose-100 text-rose-700'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}
                                      >
                                        {card.orientation === 'upright'
                                          ? '正位'
                                          : card.orientation === 'reversed'
                                          ? '逆位'
                                          : '未知'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* 查看原始响应 */}
                              {result.rawResponse && (
                                <details className="mt-3">
                                  <summary className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-700">
                                    查看原始响应
                                  </summary>
                                  <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32 whitespace-pre-wrap text-gray-700">
                                    {result.rawResponse}
                                  </pre>
                                </details>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 等待/处理中/已上传状态 */}
                      {(img.status === 'uploaded' || img.status === 'pending' || img.status === 'processing') && (
                        <div className="text-sm text-gray-500">
                          {img.status === 'processing'
                            ? '正在识别...'
                            : img.status === 'pending'
                            ? '等待识别中'
                            : '已上传，等待开始识别'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
