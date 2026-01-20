#!/usr/bin/env tsx

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { callVisionModelWithRetry, delay } from '../src/lib/vision-api';
import { VISION_RECOGNITION_PROMPT, parseVisionJsonResponse, VisionRecognitionResult } from '../src/lib/vision-prompt';
import { compareAnnotations, selectFinalLabel, CardLabel, Difference } from '../src/lib/annotation-diff';
import { loadTask, updateTaskProgress, updateImageProgress, completeTask } from '../src/lib/annotation-task';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 配置
const MODEL_ID = 'qwen/qwen3-vl-235b-a22b-thinking';
const INPUT_DIR = path.resolve(__dirname, '../../test/拍照占卜测试数据');
const OUTPUT_DIR = path.resolve(__dirname, '../../test/labels');
const DEFAULT_DELAY = 2000; // 图片间延迟 2 秒
const DUAL_DELAY = 1000; // 两次识别间延迟 1 秒

// 命令行参数
interface Args {
  taskId?: string;
  start: number;
  skipExisting: boolean;
  delay: number;
}

/**
 * 单个图片的完整标注结果
 */
interface ImageAnnotation {
  filename: string;
  timestamp: string;
  modelId: string;
  firstAnnotation: {
    cards: any[];
    totalCards: number;
    reason: string;
    rawResponse: string;
    responseTime: number;
    timestamp: string;
  };
  secondAnnotation: {
    cards: any[];
    totalCards: number;
    reason: string;
    rawResponse: string;
    responseTime: number;
    timestamp: string;
  };
  hasDifference: boolean;
  differences: Difference[];
  finalLabel: {
    cards: CardLabel[];
    totalCards: number;
    source: 'first' | 'second' | 'manual';
  };
  status: 'annotated' | 'verified' | 'conflict';
  notes?: string;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const parsed: Args = {
    start: 0,
    skipExisting: true,
    delay: DEFAULT_DELAY,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--task-id' && args[i + 1]) {
      parsed.taskId = args[i + 1];
      i++;
    } else if (args[i] === '--start' && args[i + 1]) {
      parsed.start = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--skip-existing') {
      parsed.skipExisting = true;
    } else if (args[i] === '--no-skip-existing') {
      parsed.skipExisting = false;
    } else if (args[i] === '--delay' && args[i + 1]) {
      parsed.delay = parseInt(args[i + 1], 10);
      i++;
    }
  }

  return parsed;
}

function validateEnvironment(): void {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ 错误: OPENROUTER_API_KEY 环境变量未配置');
    console.error('请在 .env 文件中配置: OPENROUTER_API_KEY=sk-or-v1-your-api-key-here');
    process.exit(1);
  }

  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ 错误: 输入目录不存在: ${INPUT_DIR}`);
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(`📁 创建输出目录: ${OUTPUT_DIR}`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function getImageList(): string[] {
  const files = fs.readdirSync(INPUT_DIR);
  const imageFiles = files.filter((file) => /\.(jpg|jpeg|png)$/i.test(file));
  return imageFiles.sort();
}

function filterImages(images: string[], args: Args): string[] {
  let filtered = images.slice(args.start);

  if (args.skipExisting) {
    filtered = filtered.filter((image) => {
      const jsonFilename = image.replace(/\.(jpg|jpeg|png)$/i, '.json');
      const jsonPath = path.join(OUTPUT_DIR, jsonFilename);
      // 只检查 labels 目录，不检查 correct_labels
      // correct_labels 是用户校对后的版本，和 labels 是同一批图片的不同版本
      return !fs.existsSync(jsonPath);
    });
  }

  return filtered;
}

/**
 * 处理单张图片（双重识别）
 */
async function processImageDual(filename: string, modelId: string, taskId?: string): Promise<ImageAnnotation> {
  const imagePath = path.join(INPUT_DIR, filename);
  const imageBuffer = fs.readFileSync(imagePath);
  const imageBase64 = imageBuffer.toString('base64');
  const mimeType = filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg') ? 'image/jpeg' : 'image/png';

  // 更新任务状态
  if (taskId) {
    updateTaskProgress(taskId, { currentImage: filename });
  }

  // 第一次识别
  console.log(`  ⏳ 第一次识别...`);
  const first = await callVisionModelWithRetry(imageBase64, mimeType, modelId, VISION_RECOGNITION_PROMPT);
  const firstParsed = parseVisionJsonResponse(first.response);

  // 更新进度
  if (taskId) {
    updateImageProgress(taskId, filename, { firstDone: true });
  }

  // 延迟避免速率限制
  await delay(DUAL_DELAY);

  // 第二次识别
  console.log(`  ⏳ 第二次识别...`);
  const second = await callVisionModelWithRetry(imageBase64, mimeType, modelId, VISION_RECOGNITION_PROMPT);
  const secondParsed = parseVisionJsonResponse(second.response);

  // 更新进度
  if (taskId) {
    updateImageProgress(taskId, filename, { secondDone: true });
  }

  // 对比差异
  const { hasDifference, differences } = compareAnnotations(firstParsed, secondParsed);
  const { cards: finalCards, source } = selectFinalLabel(firstParsed, secondParsed, differences);

  if (hasDifference) {
    console.log(`  ⚠️  发现 ${differences.length} 处差异`);
    if (taskId) {
      updateImageProgress(taskId, filename, { hasDifference: true });
    }
  }

  return {
    filename,
    timestamp: new Date().toISOString(),
    modelId,
    firstAnnotation: {
      cards: firstParsed.cards,
      totalCards: firstParsed.totalCards,
      reason: firstParsed.reason,
      rawResponse: first.response,
      responseTime: first.time,
      timestamp: new Date().toISOString(),
    },
    secondAnnotation: {
      cards: secondParsed.cards,
      totalCards: secondParsed.totalCards,
      reason: secondParsed.reason,
      rawResponse: second.response,
      responseTime: second.time,
      timestamp: new Date().toISOString(),
    },
    hasDifference,
    differences,
    finalLabel: {
      cards: finalCards,
      totalCards: finalCards.length,
      source,
    },
    status: hasDifference ? 'conflict' : 'annotated',
  };
}

async function saveAnnotation(result: ImageAnnotation): Promise<void> {
  const jsonFilename = result.filename.replace(/\.(jpg|jpeg)$/i, '.json');
  const jsonPath = path.join(OUTPUT_DIR, jsonFilename);
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
}

function printHeader(totalImages: number, taskId?: string): void {
  console.log('🏷️  塔罗牌双重标注工具');
  console.log('━'.repeat(50));
  console.log(`📁 输入目录: ${INPUT_DIR}`);
  console.log(`📁 输出目录: ${OUTPUT_DIR}`);
  console.log(`🤖 使用模型: Qwen3 VL 235B Thinking`);
  console.log(`📊 待处理: ${totalImages} 张图片`);
  if (taskId) {
    console.log(`🔖 任务 ID: ${taskId}`);
  }
  console.log('━'.repeat(50));
  console.log('');
}

function printProgress(index: number, total: number, result: ImageAnnotation): void {
  const progress = `[${index + 1}/${total}]`;
  const timeInSeconds = ((result.firstAnnotation.responseTime + result.secondAnnotation.responseTime) / 1000).toFixed(1);

  if (result.hasDifference) {
    console.log(`⚠️  ${progress} ${result.filename} - ${result.finalLabel.totalCards} 张牌，发现 ${result.differences.length} 处差异 (耗时 ${timeInSeconds}s)`);
  } else {
    console.log(`✓ ${progress} ${result.filename} - ${result.finalLabel.totalCards} 张牌，无差异 (耗时 ${timeInSeconds}s)`);
  }
}

function printSummary(successCount: number, failureCount: number, differenceCount: number, totalTime: number): void {
  console.log('');
  console.log('━'.repeat(50));
  console.log('✅ 标注完成!');
  console.log(`成功: ${successCount}/${successCount + failureCount}`);
  console.log(`失败: ${failureCount}/${successCount + failureCount}`);
  console.log(`发现差异: ${differenceCount}/${successCount}`);

  const minutes = Math.floor(totalTime / 60000);
  const seconds = Math.floor((totalTime % 60000) / 1000);
  console.log(`总耗时: ${minutes} 分 ${seconds} 秒`);
}

async function main() {
  const args = parseArgs();

  // 环境检查
  validateEnvironment();

  // 如果有 taskId，则加载任务状态
  let task = null;
  if (args.taskId) {
    task = loadTask(args.taskId);
    if (!task) {
      console.error(`❌ 错误: 找不到任务 ${args.taskId}`);
      process.exit(1);
    }

    // 更新任务状态为运行中
    updateTaskProgress(args.taskId, { status: 'running' });
  }

  // 读取图片列表
  const allImages = getImageList();
  const images = filterImages(allImages, args);

  if (images.length === 0) {
    console.log('✅ 所有图片已标注完成!');
    if (args.taskId) {
      completeTask(args.taskId, true);
    }
    return;
  }

  // 打印标题
  printHeader(images.length, args.taskId);

  // 统计
  let successCount = 0;
  let failureCount = 0;
  let differenceCount = 0;
  const startTime = Date.now();

  // 处理每张图片
  for (let i = 0; i < images.length; i++) {
    // 检查是否收到关闭信号
    if (isShuttingDown) {
      console.log('\n⚠️  检测到关闭信号，停止处理');
      break;
    }

    const filename = images[i];

    try {
      const result = await processImageDual(filename, MODEL_ID, args.taskId);
      await saveAnnotation(result);

      successCount++;
      if (result.hasDifference) {
        differenceCount++;
      }

      // 更新任务统计
      if (args.taskId) {
        const task = loadTask(args.taskId);
        if (task) {
          task.summary.successCount = successCount;
          task.summary.differenceCount = differenceCount;
          updateTaskProgress(args.taskId, { summary: task.summary });
        }
      }

      printProgress(i, images.length, result);

      // 延迟（除了最后一张）
      if (i < images.length - 1) {
        await delay(args.delay);
      }
    } catch (error) {
      console.error(`❌ ${filename} 处理失败:`, error);
      failureCount++;

      // 更新任务错误
      if (args.taskId) {
        const task = loadTask(args.taskId);
        if (task) {
          task.summary.failureCount = failureCount;
          task.errors.push(`${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          updateTaskProgress(args.taskId, {
            summary: task.summary,
            errors: task.errors,
          });
        }
        updateImageProgress(args.taskId, filename, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  // 打印总结
  const totalTime = Date.now() - startTime;
  printSummary(successCount, failureCount, differenceCount, totalTime);

  // 完成任务
  if (args.taskId) {
    completeTask(args.taskId, failureCount === 0);
  }
}

// 全局标志: 是否正在关闭
let isShuttingDown = false;

// 处理用户中断 (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n\n⚠️  收到中断信号(SIGINT)，正在保存进度...');
  console.log('💡 可使用 npm run annotate:resume 继续标注剩余图片');
  isShuttingDown = true;
  process.exit(0);
});

// 处理终止信号 (来自取消 API)
process.on('SIGTERM', () => {
  console.log('\n\n⚠️  收到终止信号(SIGTERM)，任务被取消');
  isShuttingDown = true;

  // 尝试获取当前任务ID并更新状态
  const args = parseArgs();
  if (args.taskId) {
    try {
      const task = loadTask(args.taskId);
      if (task) {
        const totalTime = Date.now() - new Date(task.startTime).getTime();
        task.summary.totalTime = totalTime;
        updateTaskProgress(args.taskId, {
          status: 'cancelled',
          summary: task.summary,
        });
        console.log('✅ 任务状态已更新为已取消');
      }
    } catch (error) {
      console.error('更新任务状态失败:', error);
    }
  }

  console.log('💡 已处理的图片结果已保留');
  process.exit(0);
});

// 运行主函数
main().catch((error) => {
  console.error('❌ 发生错误:', error);
  process.exit(1);
});
