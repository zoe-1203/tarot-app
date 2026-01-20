import { NextResponse } from 'next/server';
import { listTasks } from '@/lib/annotation-task';

// GET: 获取任务列表
export async function GET() {
  try {
    const tasks = listTasks();
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('List tasks error:', error);
    return NextResponse.json(
      {
        error: '获取任务列表失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
