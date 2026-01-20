'use client';

import { AnnotationTaskStatus } from '@/lib/annotation-task';

interface AnnotationProgressProps {
  status: AnnotationTaskStatus;
}

export function AnnotationProgress({ status }: AnnotationProgressProps) {
  const progressPercentage = status.totalImages > 0
    ? Math.round((status.processedImages / status.totalImages) * 100)
    : 0;

  // 获取最近的进度条目
  const recentProgress = status.progress.slice(-5).reverse();

  return (
    <div className="space-y-4">
      {/* 进度条 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>进度: {status.processedImages} / {status.totalImages}</span>
          <span className="font-medium text-indigo-600">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 当前处理的图片 */}
      {status.currentImage && status.status === 'running' && (
        <div className="flex items-center gap-2 text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          <span>正在处理: <span className="font-medium">{status.currentImage}</span></span>
        </div>
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-xs text-green-600 mb-1">成功</div>
          <div className="text-xl font-bold text-green-700">{status.summary.successCount}</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-xs text-red-600 mb-1">失败</div>
          <div className="text-xl font-bold text-red-700">{status.summary.failureCount}</div>
        </div>
        <div className="bg-amber-50 p-3 rounded-lg">
          <div className="text-xs text-amber-600 mb-1">有差异</div>
          <div className="text-xl font-bold text-amber-700">{status.summary.differenceCount}</div>
        </div>
      </div>

      {/* 实时日志 */}
      <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
        <div className="text-xs font-medium text-gray-600 mb-2">最近处理记录：</div>
        <div className="space-y-1">
          {recentProgress.length === 0 ? (
            <div className="text-xs text-gray-400">暂无记录</div>
          ) : (
            recentProgress.map((p, i) => (
              <div key={i} className="text-xs text-gray-700 flex items-center gap-2">
                {p.error ? (
                  <span className="text-red-600">❌</span>
                ) : p.hasDifference ? (
                  <span className="text-amber-600">⚠️</span>
                ) : (
                  <span className="text-green-600">✓</span>
                )}
                <span className="flex-1">{p.filename}</span>
                {p.error && <span className="text-red-600 text-xs">- {p.error}</span>}
                {p.hasDifference && !p.error && <span className="text-amber-600 text-xs">- 有差异</span>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 错误列表 */}
      {status.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-xs font-medium text-red-700 mb-2">错误列表：</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {status.errors.map((error, i) => (
              <div key={i} className="text-xs text-red-600">
                {i + 1}. {error}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
