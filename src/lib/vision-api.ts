import { VISION_MODELS } from './vision-models';
import {
  generateVisionPromptWithCardCount,
  generateVisionPromptWithCardCountEN,
} from './vision-prompt';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost?: number; // 美元，可选（仅当有价格信息时）
}

export interface VisionApiResponse {
  response: string;
  time: number;
  usage?: TokenUsage;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 根据模型配置获取合适的 Prompt
 * @param modelId - 模型 ID
 * @param cardCount - 可选的卡牌数量参数（默认为 "1~22"）
 * @returns 适合该模型的 Prompt 字符串
 */
export function getPromptForModel(
  modelId: string,
  cardCount?: string
): string {
  const modelConfig = VISION_MODELS.find(m => m.id === modelId);
  const useEnglish = modelConfig?.language === 'en';

  // 如果没有提供 cardCount，使用默认值 "1~22"（最多22张塔罗牌）
  const effectiveCardCount = cardCount || "1~22";

  return useEnglish
    ? generateVisionPromptWithCardCountEN(effectiveCardCount)
    : generateVisionPromptWithCardCount(effectiveCardCount);
}

// OpenRouter API 调用
export async function callOpenRouterVisionModel(
  imageBase64: string,
  mimeType: string,
  modelId: string,
  prompt: string
): Promise<VisionApiResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  // 从模型配置读取 provider 信息
  const modelConfig = VISION_MODELS.find(m => m.id === modelId);

  // 动态构建 provider 配置
  let providerConfig: { order?: string[]; allow_fallbacks?: boolean } | undefined;

  if (modelConfig?.provider) {
    providerConfig = {
      order: [modelConfig.provider],
      allow_fallbacks: modelConfig.allowFallbacks ?? true,
    };
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const requestBody: any = {
      model: modelId,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
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
      max_tokens: 4000,  // 从 4000 降低到 2000（节省成本，2000 tokens 足够完整的 JSON 响应）
      temperature: 0.3,
    };

    // 仅在有配置时添加 provider
    if (providerConfig) {
      requestBody.provider = providerConfig;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json();

    // 安全检查：确保响应格式正确
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      throw new Error(`OpenRouter API 返回了无效响应格式: ${JSON.stringify(data).substring(0, 200)}`);
    }
    if (!data.choices[0].message || !data.choices[0].message.content) {
      throw new Error(`OpenRouter API 响应中缺少 message.content: ${JSON.stringify(data.choices[0]).substring(0, 200)}`);
    }

    // 提取 token 使用信息
    const usage = data.usage || {};
    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    const totalTokens = usage.total_tokens || promptTokens + completionTokens;

    // 计算成本
    const modelConfig = VISION_MODELS.find(m => m.id === modelId);
    let estimatedCost = 0;
    if (modelConfig?.pricing) {
      const inputCost = (promptTokens / 1_000_000) * modelConfig.pricing.inputPricePerMillion;
      const outputCost = (completionTokens / 1_000_000) * modelConfig.pricing.outputPricePerMillion;
      estimatedCost = inputCost + outputCost;
    }

    return {
      response: data.choices[0].message.content,
      time: Date.now() - startTime,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
        estimatedCost, // 美元
      },
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
export async function callDoubaoVisionModel(
  imageBase64: string,
  mimeType: string,
  modelId: string,
  prompt: string
): Promise<VisionApiResponse> {
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
                text: prompt,
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

    // 安全检查：确保响应格式正确
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      throw new Error(`Doubao API 返回了无效响应格式: ${JSON.stringify(data).substring(0, 200)}`);
    }
    if (!data.choices[0].message || !data.choices[0].message.content) {
      throw new Error(`Doubao API 响应中缺少 message.content: ${JSON.stringify(data.choices[0]).substring(0, 200)}`);
    }

    // 提取 token 使用信息（如果有）
    const usage = data.usage || {};
    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    const totalTokens = usage.total_tokens || promptTokens + completionTokens;

    return {
      response: data.choices[0].message.content,
      time: Date.now() - startTime,
      usage: totalTokens > 0 ? {
        promptTokens,
        completionTokens,
        totalTokens,
        // Doubao 暂无价格信息
      } : undefined,
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
export async function callVisionModel(
  imageBase64: string,
  mimeType: string,
  modelId: string,
  prompt: string
): Promise<VisionApiResponse> {
  const modelConfig = VISION_MODELS.find(m => m.id === modelId);
  const apiType = modelConfig?.apiType || 'openrouter';

  if (apiType === 'doubao') {
    return callDoubaoVisionModel(imageBase64, mimeType, modelId, prompt);
  }

  return callOpenRouterVisionModel(imageBase64, mimeType, modelId, prompt);
}

// 带重试机制的调用函数
export async function callVisionModelWithRetry(
  imageBase64: string,
  mimeType: string,
  modelId: string,
  prompt: string,
  maxRetries: number = 2
): Promise<VisionApiResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callVisionModel(imageBase64, mimeType, modelId, prompt);
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
