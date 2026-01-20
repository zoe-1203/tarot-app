import { NextResponse } from 'next/server';
import { VISION_MODELS } from '@/lib/vision-models';
import { callVisionModelWithRetry } from '@/lib/vision-api';
import { VISION_RECOGNITION_PROMPT, generateVisionPromptWithCardCount, parseVisionJsonResponse, CardRecognitionResult } from '@/lib/vision-prompt';
import fs from 'fs';
import path from 'path';

interface BatchTestRequest {
  models: string[];
  limit?: number; // 可选：限制测试图片数量
  skipImages?: string[]; // 可选：跳过已测试的图片列表
  progressFile?: string; // 可选：进度文件路径（用于断点续测）
  testMode?: 'fixed' | 'range'; // 可选：测试模式（fixed: 固定值，range: 范围值）
  maxCards?: number; // 可选：范围模式的最大卡牌数
}

// 单张牌的标注
interface CardLabel {
  position: number;
  cardNameCn: string;
  cardNameEn: string;
  orientation: 'upright' | 'reversed';
}

// 图片标注（支持多张牌）
interface ImageLabel {
  filename: string;
  cards: CardLabel[];
  totalCards: number;
}

// Ground Truth 文件结构
interface GroundTruthFile {
  filename: string;
  correctedLabel: {
    cards: CardLabel[];
    totalCards: number;
  };
  reviewInfo: {
    reviewedBy: string;
    reviewedAt: string;
    status: string;
    notes: string;
  };
}

interface VisionModelResult {
  modelId: string;
  modelName: string;
  cards: CardRecognitionResult[];
  totalCards: number;
  reason: string;
  rawResponse: string;
  responseTime: number;
  error?: string;
}

interface ImageResult {
  filename: string;
  expected?: ImageLabel;
  results: Record<string, VisionModelResult>;
}

interface ModelStats {
  modelId: string;
  modelName: string;
  totalImages: number;
  totalCardsExpected: number;      // 预期总牌数
  totalCardsRecognized: number;    // 识别出的总牌数
  cardCountCorrect: number;        // 牌数正确的图片数
  cardNameCorrect: number;         // 牌名正确的牌数
  orientationCorrect: number;      // 正逆位正确的牌数
  combinedCorrect: number;         // 牌名+正逆位都正确的牌数
  cardNameAccuracy: number;
  orientationAccuracy: number;
  combinedAccuracy: number;
  averageTime: number;
  errors: number;
}

interface BatchTestResponse {
  imageResults: ImageResult[];
  modelStats: Record<string, ModelStats>;
  metadata: {
    totalTime: number;
    timestamp: string;
    totalImages: number;
    groundTruthCount: number;
    progressFile?: string; // 进度文件路径
  };
  error?: string;
}

const TEST_DATA_DIR = path.join(process.cwd(), '../test/拍照占卜测试数据');
const GROUND_TRUTH_DIR = path.join(process.cwd(), '../test/correct_labels');
const PROGRESS_DIR = path.join(process.cwd(), '../test/batch_test_progress');

function normalizeCardName(name: string | null): string {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

function compareCardNames(
  predicted: string | null,
  expected: string
): boolean {
  const p = normalizeCardName(predicted);
  const e = normalizeCardName(expected);
  return p === e || p.includes(e) || e.includes(p);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  try {
    const body: BatchTestRequest = await request.json();
    const { models, limit, skipImages = [], progressFile, testMode = 'fixed', maxCards = 12 } = body;

    if (!models || models.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: models' },
        { status: 400 }
      );
    }

    // 检查目录是否存在
    if (!fs.existsSync(TEST_DATA_DIR)) {
      return NextResponse.json(
        { error: `Test data directory not found: ${TEST_DATA_DIR}` },
        { status: 400 }
      );
    }

    if (!fs.existsSync(GROUND_TRUTH_DIR)) {
      return NextResponse.json(
        { error: `Ground truth directory not found: ${GROUND_TRUTH_DIR}` },
        { status: 400 }
      );
    }

    // 读取所有 ground truth 文件
    const groundTruthFiles = fs
      .readdirSync(GROUND_TRUTH_DIR)
      .filter((f) => f.endsWith('.json'))
      .sort();

    if (groundTruthFiles.length === 0) {
      return NextResponse.json(
        { error: 'No ground truth files found' },
        { status: 400 }
      );
    }

    console.log(`[Batch Ground Truth Test] 找到 ${groundTruthFiles.length} 个ground truth文件`);

    // 读取所有 ground truth 数据
    const groundTruths: Record<string, ImageLabel> = {};
    const imagesToTest: string[] = [];

    for (const gtFile of groundTruthFiles) {
      try {
        const gtPath = path.join(GROUND_TRUTH_DIR, gtFile);
        const gtData: GroundTruthFile = JSON.parse(fs.readFileSync(gtPath, 'utf-8'));

        const imageFilename = gtData.filename;
        const imagePath = path.join(TEST_DATA_DIR, imageFilename);

        // 检查对应的图片文件是否存在
        if (fs.existsSync(imagePath)) {
          groundTruths[imageFilename] = {
            filename: imageFilename,
            cards: gtData.correctedLabel.cards,
            totalCards: gtData.correctedLabel.totalCards,
          };
          imagesToTest.push(imageFilename);
        } else {
          console.warn(`[Batch GT] 图片文件不存在: ${imageFilename}`);
        }
      } catch (error) {
        console.error(`[Batch GT] 解析ground truth文件失败: ${gtFile}`, error);
      }
    }

    // 过滤掉需要跳过的图片
    let finalImagesToTest = imagesToTest.filter(img => !skipImages.includes(img));

    // 应用 limit
    if (limit && limit > 0) {
      finalImagesToTest = finalImagesToTest.slice(0, limit);
    }

    if (finalImagesToTest.length === 0) {
      return NextResponse.json(
        { error: 'No valid images to test (no matching image files for ground truth or all images skipped)' },
        { status: 400 }
      );
    }

    console.log(`[Batch GT] 将测试 ${finalImagesToTest.length} 张图片，使用 ${models.length} 个模型`);
    if (skipImages.length > 0) {
      console.log(`[Batch GT] 跳过 ${skipImages.length} 张已测试的图片`);
    }
    // 显示测试模式
    if (testMode === 'range') {
      console.log(`[Batch GT] 测试模式: 范围模式 (最多 ${maxCards} 张牌)`);
    } else {
      console.log(`[Batch GT] 测试模式: 固定值模式 (传入精确牌数)`);
    }

    // 创建进度目录
    if (!fs.existsSync(PROGRESS_DIR)) {
      fs.mkdirSync(PROGRESS_DIR, { recursive: true });
    }

    // 生成进度文件路径
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const progressFilePath = progressFile || path.join(PROGRESS_DIR, `progress-${timestamp}.json`);

    const startTime = Date.now();
    const imageResults: ImageResult[] = [];

    // 初始化模型统计
    const modelStats: Record<string, ModelStats> = {};
    models.forEach((modelId) => {
      const modelConfig = VISION_MODELS.find((m) => m.id === modelId);
      modelStats[modelId] = {
        modelId,
        modelName: modelConfig?.name || modelId,
        totalImages: 0,
        totalCardsExpected: 0,
        totalCardsRecognized: 0,
        cardCountCorrect: 0,
        cardNameCorrect: 0,
        orientationCorrect: 0,
        combinedCorrect: 0,
        cardNameAccuracy: 0,
        orientationAccuracy: 0,
        combinedAccuracy: 0,
        averageTime: 0,
        errors: 0,
      };
    });

    // 逐张处理图片
    for (let i = 0; i < finalImagesToTest.length; i++) {
      const filename = finalImagesToTest[i];
      const filePath = path.join(TEST_DATA_DIR, filename);

      console.log(`[Batch GT] [${i + 1}/${finalImagesToTest.length}] 处理图片: ${filename}`);

      // 读取图片并转为 base64
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString('base64');
      const mimeType = filename.toLowerCase().endsWith('.png')
        ? 'image/png'
        : 'image/jpeg';

      const imageResult: ImageResult = {
        filename,
        expected: groundTruths[filename],
        results: {},
      };

      // 对每个模型进行识别
      for (const modelId of models) {
        const modelConfig = VISION_MODELS.find((m) => m.id === modelId);
        const modelName = modelConfig?.name || modelId;

        try {
          console.log(`[Batch GT]   调用模型: ${modelName}`);

          // 根据测试模式生成 cardCount 参数
          const expected = groundTruths[filename];
          let cardCountParam: string;

          if (testMode === 'range') {
            // 范围模式: 智能调整最大值
            // - 如果实际牌数 <= maxCards，使用 "1~maxCards"
            // - 如果实际牌数 > maxCards，使用 "1~actualCards" (用实际牌数作为最大值)
            const effectiveMax = expected.totalCards > maxCards ? expected.totalCards : maxCards;
            cardCountParam = `1~${effectiveMax}`;
          } else {
            // 固定值模式 (默认): 使用精确的 totalCards
            cardCountParam = expected.totalCards.toString();
          }

          const promptWithCardCount = generateVisionPromptWithCardCount(cardCountParam);

          const { response, time } = await callVisionModelWithRetry(
            base64,
            mimeType,
            modelId,
            promptWithCardCount
          );

          const parsed = parseVisionJsonResponse(response);

          const result: VisionModelResult = {
            modelId,
            modelName,
            cards: parsed.cards,
            totalCards: parsed.totalCards,
            reason: parsed.reason,
            rawResponse: response,
            responseTime: time,
          };

          imageResult.results[modelId] = result;

          // 更新统计
          modelStats[modelId].totalImages++;
          modelStats[modelId].averageTime += time;
          modelStats[modelId].totalCardsRecognized += parsed.totalCards;

          // 与 ground truth 对比 (expected 已在上面定义)
          modelStats[modelId].totalCardsExpected += expected.totalCards;

          // 检查牌数是否正确
          if (parsed.totalCards === expected.totalCards) {
            modelStats[modelId].cardCountCorrect++;
          }

          // 逐张牌对比（按位置匹配）
          for (const expectedCard of expected.cards) {
            const recognizedCard = parsed.cards.find(
              (c) => c.position === expectedCard.position
            );

            if (recognizedCard) {
              const cardNameMatch =
                compareCardNames(recognizedCard.cardNameCn, expectedCard.cardNameCn) ||
                compareCardNames(recognizedCard.cardNameEn, expectedCard.cardNameEn);

              const orientationMatch =
                recognizedCard.orientation === expectedCard.orientation;

              if (cardNameMatch) {
                modelStats[modelId].cardNameCorrect++;
              }
              if (orientationMatch) {
                modelStats[modelId].orientationCorrect++;
              }
              if (cardNameMatch && orientationMatch) {
                modelStats[modelId].combinedCorrect++;
              }
            }
          }

          console.log(`[Batch GT]   ✓ ${modelName} 完成 (${time}ms)`);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          console.error(`[Batch GT]   ✗ ${modelName} 失败: ${errorMessage}`);

          imageResult.results[modelId] = {
            modelId,
            modelName,
            cards: [],
            totalCards: 0,
            reason: '',
            rawResponse: '',
            responseTime: 0,
            error: errorMessage,
          };
          modelStats[modelId].totalImages++;
          modelStats[modelId].errors++;
        }

        // 模型之间添加延迟，避免速率限制
        if (models.indexOf(modelId) < models.length - 1) {
          await delay(500);
        }
      }

      imageResults.push(imageResult);

      // 实时保存进度到文件
      const currentProgress: BatchTestResponse = {
        imageResults,
        modelStats: Object.fromEntries(
          Object.entries(modelStats).map(([id, stats]) => {
            const avgTime = stats.totalImages > 0 ? Math.round(stats.averageTime / stats.totalImages) : 0;
            const cardNameAcc = stats.totalCardsExpected > 0
              ? Math.round((stats.cardNameCorrect / stats.totalCardsExpected) * 10000) / 100
              : 0;
            const orientationAcc = stats.totalCardsExpected > 0
              ? Math.round((stats.orientationCorrect / stats.totalCardsExpected) * 10000) / 100
              : 0;
            const combinedAcc = stats.totalCardsExpected > 0
              ? Math.round((stats.combinedCorrect / stats.totalCardsExpected) * 10000) / 100
              : 0;

            return [id, {
              ...stats,
              averageTime: avgTime,
              cardNameAccuracy: cardNameAcc,
              orientationAccuracy: orientationAcc,
              combinedAccuracy: combinedAcc,
            }];
          })
        ),
        metadata: {
          totalTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          totalImages: imageResults.length,
          groundTruthCount: imagesToTest.length,
        },
      };

      fs.writeFileSync(progressFilePath, JSON.stringify(currentProgress, null, 2));
      console.log(`[Batch GT]   进度已保存: ${imageResults.length}/${finalImagesToTest.length} 完成`);

      // 图片之间添加延迟
      if (i < finalImagesToTest.length - 1) {
        await delay(1000);
      }
    }

    // 计算最终准确率（基于总牌数而非图片数）
    models.forEach((modelId) => {
      const stats = modelStats[modelId];
      if (stats.totalImages > 0) {
        stats.averageTime = Math.round(stats.averageTime / stats.totalImages);

        if (stats.totalCardsExpected > 0) {
          // 准确率基于预期的总牌数
          stats.cardNameAccuracy = Math.round(
            (stats.cardNameCorrect / stats.totalCardsExpected) * 10000
          ) / 100;
          stats.orientationAccuracy = Math.round(
            (stats.orientationCorrect / stats.totalCardsExpected) * 10000
          ) / 100;
          stats.combinedAccuracy = Math.round(
            (stats.combinedCorrect / stats.totalCardsExpected) * 10000
          ) / 100;
        }
      }
    });

    const totalTime = Date.now() - startTime;
    console.log(`[Batch GT] 测试完成，总耗时: ${Math.round(totalTime / 1000)}秒`);
    console.log(`[Batch GT] 进度文件: ${progressFilePath}`);

    const response: BatchTestResponse = {
      imageResults,
      modelStats,
      metadata: {
        totalTime,
        timestamp: new Date().toISOString(),
        totalImages: finalImagesToTest.length,
        groundTruthCount: imagesToTest.length,
        progressFile: progressFilePath,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Batch Ground Truth Test error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET 方法：获取 ground truth 数据信息
export async function GET() {
  try {
    if (!fs.existsSync(GROUND_TRUTH_DIR)) {
      return NextResponse.json(
        { error: `Ground truth directory not found: ${GROUND_TRUTH_DIR}` },
        { status: 400 }
      );
    }

    const gtFiles = fs
      .readdirSync(GROUND_TRUTH_DIR)
      .filter((f) => f.endsWith('.json'))
      .sort();

    // 检查有多少ground truth有对应的图片文件
    let validCount = 0;
    const validFiles: string[] = [];

    for (const gtFile of gtFiles) {
      try {
        const gtPath = path.join(GROUND_TRUTH_DIR, gtFile);
        const gtData: GroundTruthFile = JSON.parse(fs.readFileSync(gtPath, 'utf-8'));
        const imagePath = path.join(TEST_DATA_DIR, gtData.filename);

        if (fs.existsSync(imagePath)) {
          validCount++;
          validFiles.push(gtData.filename);
        }
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      totalGroundTruths: gtFiles.length,
      validGroundTruths: validCount,
      validImageFiles: validFiles,
    });
  } catch (error) {
    console.error('Get ground truth info error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
