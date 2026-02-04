export interface VisionModelConfig {
  id: string;
  name: string;
  vendor: string;
  speed: string;
  description: string;
  apiType?: 'openrouter' | 'doubao';  // API 类型，默认 openrouter
  language?: 'zh' | 'en';  // Prompt 语言偏好
  provider?: string;        // OpenRouter provider slug
  allowFallbacks?: boolean; // 是否允许 provider fallback
  pricing?: {
    inputPricePerMillion: number;   // 输入 token 价格（每百万 token，美元）
    outputPricePerMillion: number;  // 输出 token 价格（每百万 token，美元）
  };
}

export const VISION_MODELS: VisionModelConfig[] = [
  {
    id: 'qwen/qwen3-vl-235b-a22b-instruct',
    name: 'Qwen3 VL 235B',
    vendor: '阿里',
    speed: '较慢',
    description: 'Qwen3 最新视觉模型，235B 参数，最强性能',
  },
  {
    id: 'qwen/qwen3-vl-235b-a22b-thinking',
    name: 'Qwen3 VL 235B Thinking',
    vendor: '阿里',
    speed: '较慢',
    description: 'Qwen3 视觉模型 Thinking 版本，专注多模态推理',
  },
  {
    id: 'qwen/qwen-vl-plus',
    name: 'Qwen VL Plus',
    vendor: '阿里',
    speed: '中速',
    description: '通义千问视觉模型，平衡性能与成本',
  },
  {
    id: 'qwen/qwen-vl-max',
    name: 'Qwen VL Max',
    vendor: '阿里',
    speed: '较慢',
    description: '通义千问视觉模型，最强性能',
  },
  {
    id: 'doubao-seed-1-8-251228',
    name: 'Doubao Seed 1.8',
    vendor: '字节跳动',
    speed: '中速',
    description: '豆包视觉模型，字节跳动出品',
    apiType: 'doubao',
  },
  {
    id: 'google/gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    vendor: 'Google',
    speed: '中速',
    description: 'Google最新旗舰多模态模型，1M上下文窗口',
    apiType: 'openrouter',
    language: 'en',
    provider: 'Google',
    allowFallbacks: false,
    pricing: {
      inputPricePerMillion: 2.00,   // $2.00 per million input tokens
      outputPricePerMillion: 12.00, // $12.00 per million output tokens
    },
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    vendor: 'OpenAI',
    speed: '较快',
    description: 'OpenAI最新omni模型，视觉能力强大（取代了GPT-4 Vision）',
    apiType: 'openrouter',
    language: 'en',
    provider: 'OpenAI',
    allowFallbacks: false,
    pricing: {
      inputPricePerMillion: 2.50,   // $2.50 per million input tokens
      outputPricePerMillion: 10.00, // $10.00 per million output tokens
    },
  },
  {
    id: 'openai/gpt-5.2',
    name: 'GPT-5.2',
    vendor: 'OpenAI',
    speed: '中速',
    description: 'OpenAI最新GPT-5系列，自适应推理能力强',
    apiType: 'openrouter',
    language: 'en',
    provider: 'OpenAI',
    allowFallbacks: false,
    pricing: {
      inputPricePerMillion: 3.00,   // 估算价格（可能更贵）
      outputPricePerMillion: 12.00, // 估算价格
    },
  },
];
