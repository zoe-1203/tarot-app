import { NextResponse } from 'next/server';
import { loadTask } from '@/lib/annotation-task';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: '缺少 taskId 参数' }, { status: 400 });
    }

    const task = loadTask(taskId);

    if (!task) {
      return NextResponse.json({ error: `找不到任务: ${taskId}` }, { status: 404 });
    }

    // 计算进度百分比
    const progressPercentage = task.totalImages > 0 ? Math.round((task.processedImages / task.totalImages) * 100) : 0;

    return NextResponse.json({
      ...task,
      progressPercentage,
    });
  } catch (error) {
    console.error('Get task status error:', error);
    return NextResponse.json(
      {
        error: '查询任务状态失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
