import { NextResponse } from 'next/server';
import { drawCards, buildSystemPrompt, formatCardList, TarotResult, ModelResult, MultiModelResponse, PromptConfig, DrawnCard } from '@/lib/tarot';
import { AVAILABLE_MODELS } from '@/lib/models';
import { getLayoutDetails } from '@/lib/layout-utils';

interface RequestBody {
  question: string;
  cardCount: number;
  batchCount: number;
  models: string[];
  hookQuestion?: string;
  additionalQuestionTextInfo?: string;
  cardLayoutName?: string;
  cardPatternLayoutAnalysis?: string;
  timeInfo?: string;
  language?: string;
  layoutId?: string;
  includeCardMeaning?: boolean;
  comparisonMode?: boolean;
  manualCards?: DrawnCard[];
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callAIModel(systemPrompt: string, model: string = 'anthropic/claude-sonnet-4'): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: '请为我解读这些塔罗牌。' }
      ],
      max_tokens: 2000,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAIModelWithRetry(
  systemPrompt: string,
  modelId: string,
  maxRetries = 3
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await callAIModel(systemPrompt, modelId);
    } catch (error: any) {
      if (error.message?.includes('429') && attempt < maxRetries - 1) {
        const delayMs = Math.pow(2, attempt) * 1000;
        await delay(delayMs);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

async function processModelBatch(
  modelId: string,
  promptConfig: PromptConfig,
  batchCount: number,
  comparisonMode: boolean = false
): Promise<ModelResult> {
  const calls: TarotResult[] = [];
  const modelName = AVAILABLE_MODELS.find(m => m.id === modelId)?.name || modelId;

  if (comparisonMode) {
    // 对比模式: 生成"有牌意"和"无牌意"两个版本
    const configs = [
      { ...promptConfig, includeCardMeaning: true },   // 有牌意
      { ...promptConfig, includeCardMeaning: false }   // 无牌意
    ];

    for (let configIndex = 0; configIndex < configs.length; configIndex++) {
      const config = configs[configIndex];
      const systemPrompt = buildSystemPrompt(config);
      const label = configIndex === 0 ? '有牌意' : '无牌意';

      try {
        const response = await callAIModelWithRetry(systemPrompt, modelId);

        calls.push({
          index: configIndex,
          question: config.question,
          drawnCards: config.drawnCards,
          cardListText: formatCardList(config.drawnCards),
          systemPrompt,
          response,
          timestamp: new Date().toISOString(),
          label
        });

        if (configIndex < configs.length - 1) {
          await delay(1000);
        }
      } catch (error: any) {
        calls.push({
          index: configIndex,
          question: config.question,
          drawnCards: config.drawnCards,
          cardListText: '',
          systemPrompt,
          response: `调用失败: ${error.message}`,
          timestamp: new Date().toISOString(),
          label
        });
      }
    }
  } else {
    // 正常模式: 按 batchCount 调用
    const systemPrompt = buildSystemPrompt(promptConfig);

    for (let i = 0; i < batchCount; i++) {
      try {
        const response = await callAIModelWithRetry(systemPrompt, modelId);

        calls.push({
          index: i + 1,
          question: promptConfig.question,
          drawnCards: promptConfig.drawnCards,
          cardListText: formatCardList(promptConfig.drawnCards),
          systemPrompt,
          response,
          timestamp: new Date().toISOString()
        });

        if (i < batchCount - 1) {
          await delay(1000);
        }
      } catch (error: any) {
        calls.push({
          index: i + 1,
          question: promptConfig.question,
          drawnCards: promptConfig.drawnCards,
          cardListText: '',
          systemPrompt,
          response: `调用失败: ${error.message}`,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  return {
    modelId,
    modelName,
    calls,
    stats: {
      totalCalls: calls.length,
      successCalls: calls.filter(c => !c.response.startsWith('调用失败')).length,
      failedCalls: calls.filter(c => c.response.startsWith('调用失败')).length
    }
  };
}

function formatResponse(
  results: PromiseSettledResult<ModelResult>[],
  sharedCards: any[],
  startTime: number,
  models: string[]
): MultiModelResponse {
  const formattedResults: Record<string, ModelResult> = {};

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      formattedResults[result.value.modelId] = result.value;
    } else {
      const modelId = models[index];
      const modelName = AVAILABLE_MODELS.find(m => m.id === modelId)?.name || modelId;
      formattedResults[modelId] = {
        modelId,
        modelName,
        calls: [],
        stats: { totalCalls: 0, successCalls: 0, failedCalls: 1 },
        error: result.reason?.message || 'Unknown error'
      };
    }
  });

  return {
    results: formattedResults,
    sharedCards,
    metadata: {
      totalTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }
  };
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const {
      question,
      cardCount,
      batchCount,
      models,
      hookQuestion,
      additionalQuestionTextInfo,
      cardLayoutName,
      cardPatternLayoutAnalysis,
      timeInfo,
      language,
      layoutId,
      includeCardMeaning = true,
      comparisonMode = false,
      manualCards
    } = body;

    if (!question || !cardCount || !batchCount) {
      return NextResponse.json(
        { error: 'Missing required fields: question, cardCount, batchCount' },
        { status: 400 }
      );
    }

    if (!models || models.length === 0) {
      return NextResponse.json(
        { error: '请至少选择一个模型' },
        { status: 400 }
      );
    }

    if (models.length * batchCount > 20) {
      return NextResponse.json(
        { error: '总调用次数不能超过 20 次' },
        { status: 400 }
      );
    }

    // 使用手动选择的牌或随机抽取
    const sharedCards = manualCards && manualCards.length === cardCount
      ? manualCards
      : drawCards(cardCount);

    // 获取牌阵位置信息
    const patternPositions = layoutId
      ? getLayoutDetails(layoutId)?.positions
      : undefined;

    const promptConfig: PromptConfig = {
      question,
      cardCount,
      drawnCards: sharedCards,
      hookQuestion,
      additionalQuestionTextInfo,
      cardLayoutName,
      cardPatternLayoutAnalysis,
      timeInfo,
      language,
      patternPositions,
      includeCardMeaning
    };

    const startTime = Date.now();
    const modelPromises = models.map(modelId =>
      processModelBatch(modelId, promptConfig, batchCount, comparisonMode)
    );

    const results = await Promise.allSettled(modelPromises);

    return NextResponse.json(formatResponse(results, sharedCards, startTime, models));
  } catch (error) {
    console.error('Tarot API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
