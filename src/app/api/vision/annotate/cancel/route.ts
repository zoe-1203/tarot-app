import { NextResponse } from 'next/server';
import { loadTask, updateTaskProgress } from '@/lib/annotation-task';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json({ error: '缺少 taskId 参数' }, { status: 400 });
    }

    const task = loadTask(taskId);
    if (!task) {
      return NextResponse.json({ error: `任务不存在: ${taskId}` }, { status: 404 });
    }

    if (task.status !== 'running' && task.status !== 'pending') {
      return NextResponse.json(
        { error: `任务已${task.status}，无法取消` },
        { status: 400 }
      );
    }

    // 尝试杀死进程
    if (task.processId) {
      try {
        // 使用负 PID 杀死进程组 (Unix/Linux/macOS)
        process.kill(-task.processId, 'SIGTERM');
        console.log(`✅ 已向进程组 ${task.processId} 发送 SIGTERM 信号`);
      } catch (error) {
        console.error('❌ 杀死进程失败:', error);
        // 即使失败也继续更新任务状态
      }
    } else {
      console.warn('⚠️  任务没有关联的进程 ID');
    }

    // 更新任务状态为已取消
    updateTaskProgress(taskId, {
      status: 'cancelled',
      endTime: new Date().toISOString(),
      currentImage: null,
    });

    return NextResponse.json({
      message: '任务已取消',
      taskId,
      status: 'cancelled',
    });
  } catch (error) {
    console.error('Cancel task error:', error);
    return NextResponse.json(
      {
        error: '取消任务失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
