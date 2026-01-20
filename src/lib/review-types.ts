// 人工校对相关类型定义

import { Difference } from './annotation-diff';

// 卡牌识别结果(API返回格式)
export interface CardRecognitionResult {
  position: number;
  cardNameCn: string | null;
  cardNameEn: string | null;
  orientation: 'upright' | 'reversed' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  analysisWhichCard?: string;
}

// 单次识别的完整结果
export interface AnnotationSource {
  cards: CardRecognitionResult[];
  totalCards: number;
  reason?: string;
  rawResponse?: string;
  responseTime?: number;
  timestamp?: string;
}

// 校对后的卡牌
export interface CorrectedCard {
  position: number;
  cardNameCn: string;
  cardNameEn: string;
  orientation: 'upright' | 'reversed';
  source: 'first' | 'second' | 'manual'; // 来源
  edited: boolean; // 是否被人工编辑过
}

// 图片列表项
export interface ReviewImage {
  filename: string;
  status: 'pending' | 'reviewed' | 'skipped';
  hasDifference: boolean;
  differenceCount: number;
  timestamp: string;
  totalCards?: number;
}

// 完整的校对结果
export interface CorrectedLabel {
  filename: string;
  originalAnnotation: {
    firstAnnotation: AnnotationSource;
    secondAnnotation: AnnotationSource;
    hasDifference: boolean;
    differences: Difference[];
  };
  correctedLabel: {
    cards: CorrectedCard[];
    totalCards: number;
  };
  reviewInfo: {
    reviewedBy: string;
    reviewedAt: string;
    status: 'verified' | 'pending';
    notes?: string;
  };
  version: string;
}

// API响应: 获取待校对列表
export interface ReviewListResponse {
  totalImages: number;
  reviewedImages: number;
  pendingImages: number;
  images: ReviewImage[];
}

// API响应: 获取单个标注详情
export interface ReviewDetailResponse {
  filename: string;
  imagePath: string;
  firstAnnotation: AnnotationSource;
  secondAnnotation: AnnotationSource;
  differences: Difference[];
  hasDifference: boolean;
  existingCorrection?: CorrectedLabel;
}

// API请求: 保存校对结果
export interface SaveCorrectionRequest {
  filename: string;
  correctedLabel: {
    cards: CorrectedCard[];
    totalCards: number;
  };
  notes?: string;
}

// API响应: 保存校对结果
export interface SaveCorrectionResponse {
  success: boolean;
  message: string;
  savedPath: string;
  nextImage?: ReviewImage;
}
