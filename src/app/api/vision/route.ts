import { NextResponse } from 'next/server';
import { VISION_MODELS } from '@/lib/vision-models';
import { VISION_RECOGNITION_PROMPT, parseVisionJsonResponse, CardRecognitionResult } from '@/lib/vision-prompt';

interface VisionRequest {
  imageBase64: string;
  mimeType: string;
  models: string[];
  filename?: string;
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

interface VisionResponse {
  results: Record<string, VisionModelResult>;
  metadata: {
    totalTime: number;
    timestamp: string;
    filename?: string;
  };
  error?: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callVisionModel(
  imageBase64: string,
  mimeType: string,
  modelId: string
): Promise<{ response: string; time: number }> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const startTime = Date.now();

  // 设置 60 秒超时（大模型需要更长时间）
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
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: VISION_RECOGNITION_PROMPT,
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
    const responseTime = Date.now() - startTime;

    return {
      response: data.choices[0].message.content,
      time: responseTime,
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

      // 在网络错误或速率限制时重试
      const isFetchError = lastError.message.includes('fetch failed') ||
                           lastError.message.includes('ECONNRESET') ||
                           lastError.message.includes('network');
      const isRateLimited = lastError.message.includes('429') ||
                            lastError.message.includes('rate-limited') ||
                            lastError.message.includes('rate limit');

      if ((isFetchError || isRateLimited) && attempt < maxRetries) {
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
    const body: VisionRequest = await request.json();
    const { imageBase64, mimeType, models, filename } = body;

    if (!imageBase64 || !models || models.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: imageBase64, models' },
        { status: 400 }
      );
    }

    if (models.length > 4) {
      return NextResponse.json(
        { error: '最多同时选择 4 个模型' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const results: Record<string, VisionModelResult> = {};

    // 并行调用所有选中的模型
    const modelPromises = models.map(async (modelId) => {
      const modelConfig = VISION_MODELS.find((m) => m.id === modelId);
      const modelName = modelConfig?.name || modelId;

      try {
        const { response, time } = await callVisionModelWithRetry(
          imageBase64,
          mimeType,
          modelId
        );

        const parsed = parseVisionJsonResponse(response);

        return {
          modelId,
          result: {
            modelId,
            modelName,
            ...parsed,
            rawResponse: response,
            responseTime: time,
          },
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          modelId,
          result: {
            modelId,
            modelName,
            cards: [],
            totalCards: 0,
            reason: '',
            rawResponse: '',
            responseTime: 0,
            error: errorMessage,
          },
        };
      }
    });

    const modelResults = await Promise.all(modelPromises);

    modelResults.forEach(({ modelId, result }) => {
      results[modelId] = result;
    });

    const response: VisionResponse = {
      results,
      metadata: {
        totalTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        filename,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Vision API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
