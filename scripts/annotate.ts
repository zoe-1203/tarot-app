#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { callVisionModelWithRetry, delay } from '../src/lib/vision-api';
import { VISION_RECOGNITION_PROMPT, parseVisionJsonResponse } from '../src/lib/vision-prompt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const MODEL_ID = 'qwen/qwen3-vl-235b-a22b-thinking';
const INPUT_DIR = path.resolve(__dirname, '../../test/拍照占卜测试数据');
const OUTPUT_DIR = path.resolve(__dirname, '../../test/labels');
const DEFAULT_DELAY = 2000; // 默认延迟 2 秒

// 命令行参数
interface Args {
  start: number;
  skipExisting: boolean;
  delay: number;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const parsed: Args = {
    start: 0,
    skipExisting: true,
    delay: DEFAULT_DELAY,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--start' && args[i + 1]) {
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
  const imageFiles = files.filter(file => /\.(jpg|jpeg)$/i.test(file));
  return imageFiles.sort();
}

function filterImages(images: string[], args: Args): string[] {
  let filtered = images.slice(args.start);

  if (args.skipExisting) {
    filtered = filtered.filter(image => {
      const jsonFilename = image.replace(/\.(jpg|jpeg)$/i, '.json');
      const jsonPath = path.join(OUTPUT_DIR, jsonFilename);
      return !fs.existsSync(jsonPath);
    });
  }

  return filtered;
}

interface AnnotationResult {
  filename: string;
  modelId: string;
  timestamp: string;
  success: boolean;
  cards: any[];
  totalCards: number;
  reason: string;
  rawResponse: string;
  responseTime: number;
  error?: string;
}

async function processImage(filename: string, modelId: string): Promise<AnnotationResult> {
  const imagePath = path.join(INPUT_DIR, filename);
  const imageBuffer = fs.readFileSync(imagePath);
  const imageBase64 = imageBuffer.toString('base64');
  const mimeType = filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')
    ? 'image/jpeg'
    : 'image/png';

  try {
    const { response, time } = await callVisionModelWithRetry(
      imageBase64,
      mimeType,
      modelId,
      VISION_RECOGNITION_PROMPT
    );

    const parsed = parseVisionJsonResponse(response);

    return {
      filename,
      modelId,
      timestamp: new Date().toISOString(),
      success: true,
      cards: parsed.cards,
      totalCards: parsed.totalCards,
      reason: parsed.reason,
      rawResponse: response,
      responseTime: time,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      filename,
      modelId,
      timestamp: new Date().toISOString(),
      success: false,
      cards: [],
      totalCards: 0,
      reason: '',
      rawResponse: '',
      responseTime: 0,
      error: errorMessage,
    };
  }
}

async function saveAnnotation(result: AnnotationResult): Promise<void> {
  const jsonFilename = result.filename.replace(/\.(jpg|jpeg)$/i, '.json');
  const jsonPath = path.join(OUTPUT_DIR, jsonFilename);
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
}

function printHeader(totalImages: number): void {
  console.log('🏷️  塔罗牌批量标注工具');
  console.log('━'.repeat(40));
  console.log(`📁 输入目录: ${INPUT_DIR}`);
  console.log(`📁 输出目录: ${OUTPUT_DIR}`);
  console.log(`🤖 使用模型: Qwen3 VL 235B Thinking`);
  console.log(`📊 待处理: ${totalImages} 张图片`);
  console.log('━'.repeat(40));
  console.log('');
}

function printProgress(index: number, total: number, result: AnnotationResult): void {
  const progress = `[${index + 1}/${total}]`;

  if (result.success) {
    const timeInSeconds = (result.responseTime / 1000).toFixed(1);
    console.log(`✓ ${progress} ${result.filename} - 识别到 ${result.totalCards} 张牌 (耗时 ${timeInSeconds}s)`);
  } else {
    console.log(`⚠ ${progress} ${result.filename} - 失败: ${result.error}`);
  }
}

function printSummary(successCount: number, failureCount: number, totalTime: number): void {
  console.log('');
  console.log('━'.repeat(40));
  console.log('✅ 标注完成!');
  console.log(`成功: ${successCount}/${successCount + failureCount}`);
  console.log(`失败: ${failureCount}/${successCount + failureCount}`);

  const minutes = Math.floor(totalTime / 60000);
  const seconds = Math.floor((totalTime % 60000) / 1000);
  console.log(`总耗时: ${minutes} 分 ${seconds} 秒`);
}

async function main() {
  const args = parseArgs();

  // 环境检查
  validateEnvironment();

  // 读取图片列表
  const allImages = getImageList();
  const images = filterImages(allImages, args);

  if (images.length === 0) {
    console.log('✅ 所有图片已标注完成!');
    return;
  }

  // 打印标题
  printHeader(images.length);

  // 统计
  let successCount = 0;
  let failureCount = 0;
  const startTime = Date.now();

  // 处理每张图片
  for (let i = 0; i < images.length; i++) {
    const filename = images[i];

    try {
      const result = await processImage(filename, MODEL_ID);
      await saveAnnotation(result);

      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }

      printProgress(i, images.length, result);

      // 延迟（除了最后一张）
      if (i < images.length - 1) {
        await delay(args.delay);
      }
    } catch (error) {
      console.error(`❌ 处理 ${filename} 时发生意外错误:`, error);
      failureCount++;
    }
  }

  // 打印总结
  const totalTime = Date.now() - startTime;
  printSummary(successCount, failureCount, totalTime);
}

// 处理用户中断
process.on('SIGINT', () => {
  console.log('\n\n⚠️  用户中断，正在退出...');
  console.log('💡 可使用 npm run annotate:resume 继续标注剩余图片');
  process.exit(0);
});

// 运行主函数
main().catch(error => {
  console.error('❌ 发生错误:', error);
  process.exit(1);
});
