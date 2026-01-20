import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { createTask, hasRunningTask, updateTaskProgress, updateProcessId } from '@/lib/annotation-task';

const TEST_DATA_DIR = path.join(process.cwd(), '../test/拍照占卜测试数据');
const LABELS_DIR = path.join(process.cwd(), '../test/labels');
const TASK_DIR = path.join(process.cwd(), '.tasks');

interface CreateAnnotationTaskRequest {
  modelId?: string;
  skipExisting?: boolean;
}

interface CreateAnnotationTaskResponse {
  taskId: string;
  status: string;
  totalImages: number;
  message: string;
}

export async function POST(request: Request) {
  try {
    const body: CreateAnnotationTaskRequest = await request.json();
    const { modelId = 'qwen/qwen3-vl-235b-a22b-thinking', skipExisting = true } = body;

    // 检查是否有正在运行的任务
    if (hasRunningTask()) {
      return NextResponse.json({ error: '已有任务正在运行，请等待完成后再试' }, { status: 409 });
    }

    // 1. 扫描待标注图片
    if (!fs.existsSync(TEST_DATA_DIR)) {
      return NextResponse.json({ error: `测试数据目录不存在: ${TEST_DATA_DIR}` }, { status: 404 });
    }

    const allImages = fs.readdirSync(TEST_DATA_DIR).filter((f) => /\.(jpg|jpeg)$/i.test(f)).sort();

    const unlabeledImages = skipExisting
      ? allImages.filter((img) => {
          const jsonPath = path.join(LABELS_DIR, img.replace(/\.(jpg|jpeg)$/i, '.json'));
          return !fs.existsSync(jsonPath);
        })
      : allImages;

    if (unlabeledImages.length === 0) {
      return NextResponse.json({
        message: '所有图片已标注完成',
        totalImages: 0,
      });
    }

    // 2. 创建任务
    const task = createTask(modelId, unlabeledImages);

    // 3. 启动后台进程
    const scriptPath = path.join(process.cwd(), 'scripts', 'annotate-dual.ts');

    // 创建日志文件
    if (!fs.existsSync(TASK_DIR)) {
      fs.mkdirSync(TASK_DIR, { recursive: true });
    }
    const logPath = path.join(TASK_DIR, `${task.taskId}.log`);
    const logFile = fs.openSync(logPath, 'a');

    try {
      // 使用 npx tsx 执行 TypeScript 脚本
      const child = spawn(
        'npx',
        [
          'tsx',
          scriptPath,
          '--task-id',
          task.taskId,
          skipExisting ? '--skip-existing' : '--no-skip-existing',
        ],
        {
          detached: true,
          stdio: ['ignore', logFile, logFile], // 重定向 stdout/stderr 到日志文件
          cwd: process.cwd(),
          env: { ...process.env },
        }
      );

      // 监听进程错误
      child.on('error', (err) => {
        console.error('后台进程启动失败:', err);
        updateTaskProgress(task.taskId, {
          status: 'failed',
          errors: [`进程启动失败: ${err.message}`],
        });
        fs.closeSync(logFile);
      });

      // 监听进程退出
      child.on('exit', (code, signal) => {
        if (code !== 0 && code !== null) {
          console.error(`后台进程异常退出,代码: ${code}, 信号: ${signal}`);
        }
        fs.closeSync(logFile);
      });

      // 保存进程 PID
      if (child.pid) {
        updateProcessId(task.taskId, child.pid);
        console.log(`✅ 启动批量标注任务: ${task.taskId}, 共 ${unlabeledImages.length} 张图片`);
        console.log(`📝 日志文件: ${logPath}`);
        console.log(`🔖 进程 PID: ${child.pid}`);
      } else {
        console.warn('⚠️  无法获取进程 PID');
      }

      child.unref(); // 允许父进程退出

      const response: CreateAnnotationTaskResponse = {
        taskId: task.taskId,
        status: 'pending',
        totalImages: unlabeledImages.length,
        message: `已启动批量标注任务，共 ${unlabeledImages.length} 张图片`,
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error('启动后台进程失败:', error);
      return NextResponse.json(
        {
          error: '启动后台进程失败，请检查服务器日志',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Create annotation task error:', error);
    return NextResponse.json(
      {
        error: '创建标注任务失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
