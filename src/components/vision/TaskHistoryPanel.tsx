'use client';

import { useState, useEffect } from 'react';
import { AnnotationTaskStatus } from '@/lib/annotation-task';

export function TaskHistoryPanel() {
  const [tasks, setTasks] = useState<AnnotationTaskStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vision/tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('获取任务列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (taskId: string) => {
    if (!confirm('确定要删除此任务吗？')) return;

    try {
      const res = await fetch(`/api/vision/tasks/${taskId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      alert('任务已删除');
      fetchTasks();
    } catch (err) {
      alert(`删除失败：${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '等待中',
      running: '进行中',
      completed: '已完成',
      failed: '失败',
      cancelled: '已取消',
    };
    return map[status] || status;
  };

  return (
    <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">任务历史</h3>
        <button
          onClick={fetchTasks}
          disabled={loading}
          className="text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400"
        >
          {loading ? '刷新中...' : '刷新'}
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">暂无任务记录</div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.taskId}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(task.startTime).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    总计 {task.totalImages} 张图片，已处理 {task.processedImages} 张
                    {task.summary.differenceCount > 0 && (
                      <span className="text-amber-600 ml-2">• {task.summary.differenceCount} 张有差异</span>
                    )}
                  </div>
                  {task.errors.length > 0 && (
                    <div className="text-xs text-red-600 mt-1">错误: {task.errors[0]}</div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(task.taskId)}
                  disabled={task.status === 'running' || task.status === 'pending'}
                  className="text-sm text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
