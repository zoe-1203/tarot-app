'use client';

import { useState, useEffect } from 'react';
import { AnnotationProgress } from './AnnotationProgress';
import { TaskHistoryPanel } from './TaskHistoryPanel';
import { AnnotationTaskStatus } from '@/lib/annotation-task';

interface AnnotationInfo {
  totalImages: number;
  annotatedImages: number;
  verifiedImages: number;
  conflictImages: number;
}

export function BatchAnnotationPanel() {
  const [info, setInfo] = useState<AnnotationInfo | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<AnnotationTaskStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载标注信息
  const fetchAnnotationInfo = async () => {
    try {
      const res = await fetch('/api/vision/labels');
      const data = await res.json();
      setInfo({
        totalImages: data.totalImages,
        annotatedImages: data.annotatedImages,
        verifiedImages: data.verifiedImages,
        conflictImages: data.conflictImages,
      });
    } catch (err) {
      console.error('Failed to fetch annotation info:', err);
    }
  };

  useEffect(() => {
    fetchAnnotationInfo();
  }, []);

  // 轮询任务状态
  useEffect(() => {
    if (!taskId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/vision/annotate/status?taskId=${taskId}`);
        const data = await res.json();
        setTaskStatus(data);

        // 任务完成或失败时停止轮询
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
          setTaskId(null);

          if (data.status === 'completed') {
            alert(
              `✅ 标注完成！\n\n` +
                `成功: ${data.summary.successCount} 张\n` +
                `失败: ${data.summary.failureCount} 张\n` +
                `发现差异: ${data.summary.differenceCount} 张\n\n` +
                `请点击"生成 labels.json"按钮生成汇总文件。`
            );
          } else {
            alert(`❌ 标注失败！\n\n错误: ${data.errors.join('\n')}`);
          }

          // 刷新标注信息
          fetchAnnotationInfo();
        }
      } catch (err) {
        console.error('Failed to fetch task status:', err);
      }
    }, 2000); // 每 2 秒轮询一次

    return () => clearInterval(interval);
  }, [taskId]);

  // 开始标注
  const handleStartAnnotation = async () => {
    if (taskId) return; // 已有任务在运行

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/vision/annotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: 'qwen/qwen3-vl-235b-a22b-thinking',
          skipExisting: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '启动任务失败');
      }

      if (data.totalImages === 0) {
        alert('所有图片已标注完成！');
        return;
      }

      setTaskId(data.taskId);
      alert(`✅ 已启动批量标注任务\n\n共 ${data.totalImages} 张图片待处理`);
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      setError(message);
      alert(`❌ 启动失败：${message}`);
    } finally {
      setLoading(false);
    }
  };

  // 取消标注
  const handleCancelAnnotation = async () => {
    if (!taskId) return;

    if (!confirm('确定要取消标注任务吗？\n\n已处理的图片结果将保留。')) {
      return;
    }

    try {
      const res = await fetch('/api/vision/annotate/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('✅ 标注任务已取消\n\n已处理的图片结果已保留');
      setTaskId(null);
      setTaskStatus(null);
      fetchAnnotationInfo(); // 刷新统计
    } catch (err) {
      alert(`❌ 取消失败：${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  // 生成 labels.json
  const handleGenerateLabelsFile = async () => {
    if (!confirm('确定要生成 labels.json 文件吗？\n这将覆盖已存在的文件。')) {
      return;
    }

    try {
      const res = await fetch('/api/vision/labels', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '生成失败');
      }

      alert(
        `✅ labels.json 已生成！\n\n` +
          `总图片数: ${data.totalImages}\n` +
          `有差异: ${data.conflictImages}\n\n` +
          `文件路径: ${data.path}`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      alert(`❌ 生成失败：${message}`);
    }
  };

  const unlabeledImages = info ? info.totalImages - info.annotatedImages : 0;

  return (
    <>
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">批量标注</h3>

      {/* 统计信息 */}
      {info && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="总图片数" value={info.totalImages} color="blue" />
          <StatCard label="已标注" value={info.annotatedImages} color="green" />
          <StatCard label="未标注" value={unlabeledImages} color="amber" />
          <StatCard label="有差异" value={info.conflictImages} color="red" />
        </div>
      )}

      {/* 说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-blue-800">
        <div className="font-medium mb-1">💡 批量标注说明</div>
        <ul className="space-y-1 text-xs">
          <li>• 每张图片将使用同一模型识别两次</li>
          <li>• 自动对比两次结果，标记差异供人工审核</li>
          <li>• 智能跳过已标注的图片，支持数据集扩充</li>
          <li>• 预计耗时：{unlabeledImages} 张 × 2 次 ≈ {Math.ceil(unlabeledImages * 30 / 60)} 分钟</li>
        </ul>
      </div>

      {/* 控制按钮 */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleStartAnnotation}
          disabled={loading || !!taskId || unlabeledImages === 0}
          className="flex-1 py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   text-white font-medium transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              启动中...
            </span>
          ) : taskId ? (
            '标注进行中...'
          ) : unlabeledImages === 0 ? (
            '无待标注图片'
          ) : (
            `开始标注 (${unlabeledImages} 张)`
          )}
        </button>

        <button
          onClick={handleCancelAnnotation}
          disabled={!taskId || taskStatus?.status !== 'running'}
          className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   text-white font-medium transition-colors"
        >
          停止标注
        </button>

        <button
          onClick={handleGenerateLabelsFile}
          disabled={!info || info.annotatedImages === 0}
          className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   text-white font-medium transition-colors"
        >
          生成 labels.json
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
          ❌ {error}
        </div>
      )}

      {/* 任务进度 */}
      {taskStatus && <AnnotationProgress status={taskStatus} />}

      {/* 差异提示 */}
      {info && info.conflictImages > 0 && !taskId && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
            ⚠️ 发现 {info.conflictImages} 张图片有差异
          </div>
          <div className="text-sm text-amber-700 mb-3">
            建议人工审核这些图片的标注结果，确保准确性。
          </div>
          <button
            className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded"
            onClick={() => alert('差异查看功能开发中...')}
          >
            查看差异列表
          </button>
        </div>
      )}
    </div>

    {/* 任务历史面板 */}
    <TaskHistoryPanel />
    </>
  );
}

// 统计卡片组件
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="text-xs opacity-75 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
