import { NextResponse } from 'next/server';
import { loadTask } from '@/lib/annotation-task';
import fs from 'fs';
import path from 'path';

// DELETE: 删除任务
export async function DELETE(request: Request, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const { taskId } = await params;
    const TASK_DIR = path.join(process.cwd(), '.tasks');
    const taskFile = path.join(TASK_DIR, `${taskId}.json`);
    const logFile = path.join(TASK_DIR, `${taskId}.log`);

    // 检查任务是否存在
    const task = loadTask(taskId);
    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    // 不允许删除正在运行的任务
    if (task.status === 'running' || task.status === 'pending') {
      return NextResponse.json({ error: '不能删除正在运行的任务，请先取消' }, { status: 400 });
    }

    // 删除任务文件和日志
    if (fs.existsSync(taskFile)) fs.unlinkSync(taskFile);
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

    return NextResponse.json({ message: '任务已删除', taskId });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      {
        error: '删除任务失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
