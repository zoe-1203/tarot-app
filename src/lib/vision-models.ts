export interface VisionModelConfig {
  id: string;
  name: string;
  vendor: string;
  speed: string;
  description: string;
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
    id: 'qwen/qwen3-vl-235b-a22b-instruct:thinking',
    name: 'Qwen3 VL 235B Thinking',
    vendor: '阿里',
    speed: '较慢',
    description: 'Qwen3 视觉模型 Thinking 版本，支持深度推理',
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
];
