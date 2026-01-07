export interface ModelConfig {
  id: string;
  name: string;
  vendor: string;
  speed: string;
  description: string;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    vendor: 'Anthropic',
    speed: '中速',
    description: '平衡的理解与生成能力'
  },
  {
    id: 'google/gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    vendor: 'Google',
    speed: '快速',
    description: '快速响应，适合批量处理'
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    vendor: 'OpenAI',
    speed: '快速',
    description: '快速且经济的模型'
  },
  {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    vendor: 'Anthropic',
    speed: '极快',
    description: '最快速的 Claude 模型'
  }
];
