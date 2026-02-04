import { NextResponse } from 'next/server';
import { VISION_MODELS } from '@/lib/vision-models';
import { parseVisionJsonResponse, CardRecognitionResult } from '@/lib/vision-prompt';
import { callVisionModelWithRetry, getPromptForModel, TokenUsage } from '@/lib/vision-api';

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
  usage?: TokenUsage;
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

// API 调用函数已移至 @/lib/vision-api.ts

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
        // 使用动态 Prompt 选择（根据模型配置自动选择中文或英文）
        const prompt = getPromptForModel(modelId);

        const { response, time, usage } = await callVisionModelWithRetry(
          imageBase64,
          mimeType,
          modelId,
          prompt
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
            usage,
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
