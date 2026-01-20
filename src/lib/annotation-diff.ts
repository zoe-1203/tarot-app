import { VisionRecognitionResult, CardRecognitionResult } from './vision-prompt';

/**
 * 差异类型
 */
export type DifferenceType = 'cardCount' | 'cardName' | 'orientation' | 'position' | 'confidence';

/**
 * 差异严重程度
 */
export type DifferenceSeverity = 'critical' | 'major' | 'minor';

/**
 * 单个差异
 */
export interface Difference {
  type: DifferenceType;
  position?: number;
  severity: DifferenceSeverity;
  description: string;
  first: any;
  second: any;
}

/**
 * 最终标注中的单张牌
 */
export interface CardLabel {
  position: number;
  cardNameCn: string;
  cardNameEn: string;
  orientation: 'upright' | 'reversed';
}

/**
 * 对比两次识别结果，生成差异列表
 */
export function compareAnnotations(
  first: VisionRecognitionResult,
  second: VisionRecognitionResult
): { hasDifference: boolean; differences: Difference[] } {
  const differences: Difference[] = [];

  // 1. 检查牌数差异
  if (first.totalCards !== second.totalCards) {
    differences.push({
      type: 'cardCount',
      severity: 'critical',
      description: `牌数不一致: 第一次识别到 ${first.totalCards} 张，第二次识别到 ${second.totalCards} 张`,
      first: first.totalCards,
      second: second.totalCards,
    });
  }

  // 2. 逐张对比（按位置匹配）
  const maxCards = Math.max(first.cards.length, second.cards.length);
  for (let i = 0; i < maxCards; i++) {
    const card1 = first.cards.find((c) => c.position === i + 1);
    const card2 = second.cards.find((c) => c.position === i + 1);

    // 缺失牌
    if (!card1 || !card2) {
      differences.push({
        type: 'position',
        position: i + 1,
        severity: 'critical',
        description: `位置 ${i + 1} 的牌在${!card1 ? '第一次' : '第二次'}识别中缺失`,
        first: card1 || null,
        second: card2 || null,
      });
      continue;
    }

    // 牌名差异
    if (!isSameCard(card1, card2)) {
      differences.push({
        type: 'cardName',
        position: i + 1,
        severity: 'critical',
        description: `位置 ${i + 1} 牌名不一致: 「${card1.cardNameCn || card1.cardNameEn}」vs「${
          card2.cardNameCn || card2.cardNameEn
        }」`,
        first: {
          cardNameCn: card1.cardNameCn,
          cardNameEn: card1.cardNameEn,
        },
        second: {
          cardNameCn: card2.cardNameCn,
          cardNameEn: card2.cardNameEn,
        },
      });
    }

    // 正逆位差异
    if (card1.orientation !== card2.orientation && card1.orientation !== 'unknown' && card2.orientation !== 'unknown') {
      differences.push({
        type: 'orientation',
        position: i + 1,
        severity: 'major',
        description: `位置 ${i + 1} 正逆位不一致: ${translateOrientation(card1.orientation)} vs ${translateOrientation(
          card2.orientation
        )}`,
        first: card1.orientation,
        second: card2.orientation,
      });
    }

    // 置信度差异（仅提示）
    if (card1.confidence !== card2.confidence) {
      differences.push({
        type: 'confidence',
        position: i + 1,
        severity: 'minor',
        description: `位置 ${i + 1} 置信度不同: ${translateConfidence(card1.confidence)} vs ${translateConfidence(
          card2.confidence
        )}`,
        first: card1.confidence,
        second: card2.confidence,
      });
    }
  }

  return {
    hasDifference: differences.length > 0,
    differences,
  };
}

/**
 * 判断两张牌是否相同（忽略大小写和空格）
 */
function isSameCard(card1: CardRecognitionResult, card2: CardRecognitionResult): boolean {
  const normalize = (name: string | null) => (name || '').toLowerCase().trim().replace(/\s+/g, ' ');

  const cn1 = normalize(card1.cardNameCn);
  const cn2 = normalize(card2.cardNameCn);
  const en1 = normalize(card1.cardNameEn);
  const en2 = normalize(card2.cardNameEn);

  // 中文名或英文名任一匹配即认为是同一张牌
  return (cn1 === cn2 && cn1 !== '') || (en1 === en2 && en1 !== '');
}

/**
 * 自动选择最终标注（优先级：置信度高 > 无差异 > 第一次）
 */
export function selectFinalLabel(
  first: VisionRecognitionResult,
  second: VisionRecognitionResult,
  differences: Difference[]
): { cards: CardLabel[]; source: 'first' | 'second' } {
  // 如果无差异，优先使用第一次
  if (differences.length === 0) {
    return {
      cards: convertToCardLabels(first.cards),
      source: 'first',
    };
  }

  // 有差异时，比较整体置信度
  const firstHighConfidence = first.cards.filter((c) => c.confidence === 'high').length;
  const secondHighConfidence = second.cards.filter((c) => c.confidence === 'high').length;

  // 如果第二次高置信度更多，使用第二次
  if (secondHighConfidence > firstHighConfidence) {
    return {
      cards: convertToCardLabels(second.cards),
      source: 'second',
    };
  }

  // 默认使用第一次
  return {
    cards: convertToCardLabels(first.cards),
    source: 'first',
  };
}

/**
 * 将识别结果转换为标注格式
 */
function convertToCardLabels(cards: CardRecognitionResult[]): CardLabel[] {
  return cards.map((c) => ({
    position: c.position,
    cardNameCn: c.cardNameCn || '',
    cardNameEn: c.cardNameEn || '',
    orientation: c.orientation === 'unknown' ? 'upright' : c.orientation,
  }));
}

/**
 * 翻译正逆位
 */
function translateOrientation(orientation: string): string {
  switch (orientation) {
    case 'upright':
      return '正位';
    case 'reversed':
      return '逆位';
    case 'unknown':
      return '未知';
    default:
      return orientation;
  }
}

/**
 * 翻译置信度
 */
function translateConfidence(confidence: string): string {
  switch (confidence) {
    case 'high':
      return '高';
    case 'medium':
      return '中';
    case 'low':
      return '低';
    default:
      return confidence;
  }
}

/**
 * 获取差异统计
 */
export function getDifferenceStats(differences: Difference[]): {
  criticalCount: number;
  majorCount: number;
  minorCount: number;
} {
  return {
    criticalCount: differences.filter((d) => d.severity === 'critical').length,
    majorCount: differences.filter((d) => d.severity === 'major').length,
    minorCount: differences.filter((d) => d.severity === 'minor').length,
  };
}
