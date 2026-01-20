import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

/**
 * 任务状态
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * 单张图片的处理进度
 */
export interface ImageProgress {
  filename: string;
  firstDone: boolean;
  secondDone: boolean;
  hasDifference: boolean;
  error?: string;
}

/**
 * 任务状态数据
 */
export interface AnnotationTaskStatus {
  taskId: string;
  status: TaskStatus;
  modelId: string;
  totalImages: number;
  processedImages: number;
  currentImage: string | null;
  progress: ImageProgress[];
  summary: {
    successCount: number;
    failureCount: number;
    differenceCount: number;
    totalTime: number;
  };
  startTime: string;
  endTime?: string;
  errors: string[];
  processId?: number; // 新增: 保存后台进程 PID
}

// 任务文件存储目录（Vercel 环境只有 /tmp 可写）
const TASK_DIR = process.env.VERCEL ? '/tmp/tarot-annotation-tasks' : path.join(process.cwd(), '.tasks');

/**
 * 确保任务目录存在
 */
function ensureTaskDir(): void {
  if (!fs.existsSync(TASK_DIR)) {
    fs.mkdirSync(TASK_DIR, { recursive: true });
  }
}

/**
 * 创建新任务
 */
export function createTask(modelId: string, images: string[]): AnnotationTaskStatus {
  ensureTaskDir();

  const taskId = randomUUID();
  const task: AnnotationTaskStatus = {
    taskId,
    status: 'pending',
    modelId,
    totalImages: images.length,
    processedImages: 0,
    currentImage: null,
    progress: images.map((filename) => ({
      filename,
      firstDone: false,
      secondDone: false,
      hasDifference: false,
    })),
    summary: {
      successCount: 0,
      failureCount: 0,
      differenceCount: 0,
      totalTime: 0,
    },
    startTime: new Date().toISOString(),
    errors: [],
  };

  saveTask(task);
  return task;
}

/**
 * 保存任务状态
 */
export function saveTask(task: AnnotationTaskStatus): void {
  ensureTaskDir();
  const taskFile = path.join(TASK_DIR, `${task.taskId}.json`);
  fs.writeFileSync(taskFile, JSON.stringify(task, null, 2), 'utf-8');
}

/**
 * 加载任务状态
 */
export function loadTask(taskId: string): AnnotationTaskStatus | null {
  ensureTaskDir();
  const taskFile = path.join(TASK_DIR, `${taskId}.json`);

  if (!fs.existsSync(taskFile)) {
    return null;
  }

  try {
    const data = fs.readFileSync(taskFile, 'utf-8');
    return JSON.parse(data) as AnnotationTaskStatus;
  } catch (error) {
    console.error(`Failed to load task ${taskId}:`, error);
    return null;
  }
}

/**
 * 更新任务进度
 */
export function updateTaskProgress(
  taskId: string,
  updates: Partial<AnnotationTaskStatus>
): AnnotationTaskStatus | null {
  const task = loadTask(taskId);
  if (!task) {
    return null;
  }

  const updatedTask: AnnotationTaskStatus = {
    ...task,
    ...updates,
  };

  saveTask(updatedTask);
  return updatedTask;
}

/**
 * 更新单张图片的进度
 */
export function updateImageProgress(
  taskId: string,
  filename: string,
  updates: Partial<ImageProgress>
): AnnotationTaskStatus | null {
  const task = loadTask(taskId);
  if (!task) {
    return null;
  }

  const imageIndex = task.progress.findIndex((p) => p.filename === filename);
  if (imageIndex === -1) {
    return null;
  }

  task.progress[imageIndex] = {
    ...task.progress[imageIndex],
    ...updates,
  };

  // 更新处理计数
  task.processedImages = task.progress.filter((p) => p.firstDone && p.secondDone).length;

  saveTask(task);
  return task;
}

/**
 * 标记任务完成
 */
export function completeTask(taskId: string, success: boolean, error?: string): AnnotationTaskStatus | null {
  const task = loadTask(taskId);
  if (!task) {
    return null;
  }

  task.status = success ? 'completed' : 'failed';
  task.endTime = new Date().toISOString();
  task.currentImage = null;

  if (error) {
    task.errors.push(error);
  }

  // 计算总耗时
  task.summary.totalTime = new Date(task.endTime).getTime() - new Date(task.startTime).getTime();

  saveTask(task);
  return task;
}

/**
 * 获取所有任务列表
 */
export function listTasks(): AnnotationTaskStatus[] {
  ensureTaskDir();

  const files = fs.readdirSync(TASK_DIR).filter((f) => f.endsWith('.json'));
  const tasks: AnnotationTaskStatus[] = [];

  for (const file of files) {
    try {
      const data = fs.readFileSync(path.join(TASK_DIR, file), 'utf-8');
      tasks.push(JSON.parse(data));
    } catch (error) {
      console.error(`Failed to parse task file ${file}:`, error);
    }
  }

  // 按创建时间倒序排列
  return tasks.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

/**
 * 删除旧任务（超过 7 天的任务）
 */
export function cleanOldTasks(): number {
  ensureTaskDir();

  const files = fs.readdirSync(TASK_DIR).filter((f) => f.endsWith('.json'));
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let deletedCount = 0;

  for (const file of files) {
    const filePath = path.join(TASK_DIR, file);
    const stats = fs.statSync(filePath);

    if (stats.mtimeMs < sevenDaysAgo) {
      fs.unlinkSync(filePath);
      deletedCount++;
    }
  }

  return deletedCount;
}

/**
 * 检查是否有正在运行的任务
 */
export function hasRunningTask(): boolean {
  const tasks = listTasks();
  return tasks.some((t) => t.status === 'running' || t.status === 'pending');
}

/**
 * 更新任务的进程 ID
 */
export function updateProcessId(taskId: string, processId: number): void {
  const task = loadTask(taskId);
  if (task) {
    task.processId = processId;
    saveTask(task);
  }
}
