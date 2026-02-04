import { NextResponse } from 'next/server';
import { VISION_MODELS } from '@/lib/vision-models';
import { parseVisionJsonResponse, CardRecognitionResult } from '@/lib/vision-prompt';
import { getPromptForModel } from '@/lib/vision-api';
import fs from 'fs';
import path from 'path';

interface BatchTestRequest {
  models: string[];
  limit?: number; // 可选：限制测试图片数量
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

interface LabelsFile {
  images: ImageLabel[];
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
    hasLabels: boolean;
  };
  error?: string;
}

const TEST_DATA_DIR = path.join(process.cwd(), '../test/拍照占卜测试数据');

// OpenRouter API 调用
async function callOpenRouterVisionModel(
  imageBase64: string,
  mimeType: string,
  modelId: string
): Promise<{ response: string; time: number }> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: modelId,
        provider: {
          order: ['Alibaba'],
          allow_fallbacks: true,
        },
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: getPromptForModel(modelId),
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json();
    return {
      response: data.choices[0].message.content,
      time: Date.now() - startTime,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`请求超时（60秒），模型 ${modelId} 响应过慢`);
      }
      throw new Error(`${modelId}: ${error.message}`);
    }
    throw error;
  }
}

// 豆包 API 调用
async function callDoubaoVisionModel(
  imageBase64: string,
  mimeType: string,
  modelId: string
): Promise<{ response: string; time: number }> {
  const apiKey = process.env.DOUBAO_API_KEY;

  if (!apiKey) {
    throw new Error('DOUBAO_API_KEY is not configured');
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 豆包超时 120 秒

  try {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
              {
                type: 'text',
                text: VISION_RECOGNITION_PROMPT,
              },
            ],
          },
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Doubao API error: ${error}`);
    }

    const data = await response.json();
    return {
      response: data.choices[0].message.content,
      time: Date.now() - startTime,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`请求超时（120秒），模型 ${modelId} 响应过慢`);
      }
      throw new Error(`${modelId}: ${error.message}`);
    }
    throw error;
  }
}

// 统一调用入口，根据模型配置选择 API
async function callVisionModel(
  imageBase64: string,
  mimeType: string,
  modelId: string
): Promise<{ response: string; time: number }> {
  const modelConfig = VISION_MODELS.find(m => m.id === modelId);
  const apiType = modelConfig?.apiType || 'openrouter';

  if (apiType === 'doubao') {
    return callDoubaoVisionModel(imageBase64, mimeType, modelId);
  }

  return callOpenRouterVisionModel(imageBase64, mimeType, modelId);
}

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

// 带重试机制的调用函数
async function callVisionModelWithRetry(
  imageBase64: string,
  mimeType: string,
  modelId: string,
  maxRetries: number = 2
): Promise<{ response: string; time: number }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callVisionModel(imageBase64, mimeType, modelId);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // 在网络错误、速率限制或超时时重试
      const isFetchError = lastError.message.includes('fetch failed') ||
                           lastError.message.includes('ECONNRESET') ||
                           lastError.message.includes('network');
      const isRateLimited = lastError.message.includes('429') ||
                            lastError.message.includes('rate-limited') ||
                            lastError.message.includes('rate limit');
      const isTimeout = lastError.message.includes('超时') ||
                        lastError.message.includes('timeout') ||
                        lastError.message.includes('AbortError');

      if ((isFetchError || isRateLimited || isTimeout) && attempt < maxRetries) {
        // 速率限制时等待更长时间
        const waitTime = isRateLimited ? 3000 * (attempt + 1) : 1000 * (attempt + 1);
        console.log(`[${modelId}] 重试 ${attempt + 1}/${maxRetries}，等待 ${waitTime/1000}秒...`);
        await delay(waitTime);
        continue;
      }

      throw lastError;
    }
  }

  throw lastError;
}

export async function POST(request: Request) {
  try {
    const body: BatchTestRequest = await request.json();
    const { models, limit } = body;

    if (!models || models.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: models' },
        { status: 400 }
      );
    }

    // 检查测试数据目录是否存在
    if (!fs.existsSync(TEST_DATA_DIR)) {
      return NextResponse.json(
        { error: `Test data directory not found: ${TEST_DATA_DIR}` },
        { status: 400 }
      );
    }

    // 读取图片文件列表
    let imageFiles = fs
      .readdirSync(TEST_DATA_DIR)
      .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
      .sort();

    if (limit && limit > 0) {
      imageFiles = imageFiles.slice(0, limit);
    }

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'No image files found in test directory' },
        { status: 400 }
      );
    }

    // 尝试读取标注文件
    let labels: Record<string, ImageLabel> = {};
    let hasLabels = false;
    const labelsPath = path.join(TEST_DATA_DIR, 'labels.json');

    if (fs.existsSync(labelsPath)) {
      try {
        const labelsData: LabelsFile = JSON.parse(
          fs.readFileSync(labelsPath, 'utf-8')
        );
        labelsData.images.forEach((img) => {
          labels[img.filename] = img;
        });
        hasLabels = true;
      } catch {
        console.warn('Failed to parse labels.json');
      }
    }

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
    for (let i = 0; i < imageFiles.length; i++) {
      const filename = imageFiles[i];
      const filePath = path.join(TEST_DATA_DIR, filename);

      // 读取图片并转为 base64
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString('base64');
      const mimeType = filename.toLowerCase().endsWith('.png')
        ? 'image/png'
        : 'image/jpeg';

      const imageResult: ImageResult = {
        filename,
        expected: labels[filename],
        results: {},
      };

      // 对每个模型进行识别
      for (const modelId of models) {
        const modelConfig = VISION_MODELS.find((m) => m.id === modelId);
        const modelName = modelConfig?.name || modelId;

        try {
          const { response, time } = await callVisionModelWithRetry(
            base64,
            mimeType,
            modelId
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

          // 如果有标注，计算准确率
          if (labels[filename]) {
            const expected = labels[filename];
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
          }
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
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

      // 图片之间添加延迟
      if (i < imageFiles.length - 1) {
        await delay(1000);
      }
    }

    // 计算最终准确率（基于总牌数而非图片数）
    models.forEach((modelId) => {
      const stats = modelStats[modelId];
      if (stats.totalImages > 0) {
        stats.averageTime = Math.round(stats.averageTime / stats.totalImages);

        if (hasLabels && stats.totalCardsExpected > 0) {
          // 准确率基于预期的总牌数
          stats.cardNameAccuracy = Math.round(
            (stats.cardNameCorrect / stats.totalCardsExpected) * 100
          );
          stats.orientationAccuracy = Math.round(
            (stats.orientationCorrect / stats.totalCardsExpected) * 100
          );
          stats.combinedAccuracy = Math.round(
            (stats.combinedCorrect / stats.totalCardsExpected) * 100
          );
        }
      }
    });

    const response: BatchTestResponse = {
      imageResults,
      modelStats,
      metadata: {
        totalTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        totalImages: imageFiles.length,
        hasLabels,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Batch Vision API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET 方法：获取测试数据信息
export async function GET() {
  try {
    if (!fs.existsSync(TEST_DATA_DIR)) {
      return NextResponse.json(
        { error: `Test data directory not found: ${TEST_DATA_DIR}` },
        { status: 400 }
      );
    }

    const imageFiles = fs
      .readdirSync(TEST_DATA_DIR)
      .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
      .sort();

    const labelsPath = path.join(TEST_DATA_DIR, 'labels.json');
    const hasLabels = fs.existsSync(labelsPath);

    let labeledCount = 0;
    if (hasLabels) {
      try {
        const labelsData: LabelsFile = JSON.parse(
          fs.readFileSync(labelsPath, 'utf-8')
        );
        labeledCount = labelsData.images.length;
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      totalImages: imageFiles.length,
      hasLabels,
      labeledCount,
      images: imageFiles,
    });
  } catch (error) {
    console.error('Get test info error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
