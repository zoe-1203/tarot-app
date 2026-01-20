/**
 * 卡牌名称匹配辅助函数
 * 用于匹配 AI 返回的卡牌名称与标准库中的名称
 */

import cardNamesStandard from './card-names-standard.json';

// 卡牌信息接口
export interface CardInfo {
  key: string;
  enName: string;
  cnName: string;
  arcana: string;
  suit: string | null;
  rank: string | null;
}

/**
 * 规范化卡牌名称（去除空格、转小写）
 */
function normalizeCardName(name: string | null): string {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * 根据英文名查找标准卡牌信息
 * @param enName - AI 返回的英文名称
 * @returns 标准卡牌信息，如果未找到返回 null
 */
export function findStandardEnName(enName: string): CardInfo | null {
  const normalized = normalizeCardName(enName);

  for (const card of cardNamesStandard.allCards) {
    const standardNormalized = normalizeCardName(card.enName);

    // 精确匹配或模糊匹配
    if (standardNormalized === normalized ||
        standardNormalized.includes(normalized) ||
        normalized.includes(standardNormalized)) {
      return card as CardInfo;
    }
  }

  return null;
}

/**
 * 根据中文名查找标准卡牌信息
 * @param cnName - AI 返回的中文名称
 * @returns 标准卡牌信息，如果未找到返回 null
 */
export function findStandardCnName(cnName: string): CardInfo | null {
  const normalized = normalizeCardName(cnName);

  for (const card of cardNamesStandard.allCards) {
    const standardNormalized = normalizeCardName(card.cnName);

    // 精确匹配或模糊匹配
    if (standardNormalized === normalized ||
        standardNormalized.includes(normalized) ||
        normalized.includes(standardNormalized)) {
      return card as CardInfo;
    }
  }

  return null;
}

/**
 * 验证卡牌名称是否有效（中英文名称是否匹配同一张牌）
 * @param enName - 英文名称
 * @param cnName - 中文名称
 * @returns 是否为有效的卡牌名称组合
 */
export function isValidCardName(enName: string, cnName: string): boolean {
  const enMatch = findStandardEnName(enName);
  const cnMatch = findStandardCnName(cnName);

  // 如果都没找到，返回 false
  if (!enMatch && !cnMatch) {
    return false;
  }

  // 如果只找到一个，认为有效（可能另一个是格式问题）
  if (!enMatch || !cnMatch) {
    return true;
  }

  // 如果都找到了，检查是否指向同一张牌
  return enMatch.key === cnMatch.key;
}

/**
 * 获取标准的英文名称
 * @param enName - AI 返回的英文名称
 * @returns 标准英文名称，如果未找到返回原始名称
 */
export function getStandardEnName(enName: string): string {
  const match = findStandardEnName(enName);
  return match ? match.enName : enName;
}

/**
 * 获取标准的中文名称
 * @param cnName - AI 返回的中文名称
 * @returns 标准中文名称，如果未找到返回原始名称
 */
export function getStandardCnName(cnName: string): string {
  const match = findStandardCnName(cnName);
  return match ? match.cnName : cnName;
}

/**
 * 获取所有标准卡牌列表
 * @returns 78 张标准卡牌的完整列表
 */
export function getAllCards(): CardInfo[] {
  return cardNamesStandard.allCards as CardInfo[];
}

/**
 * 根据花色获取卡牌列表
 * @param suit - 花色：'Wands' | 'Cups' | 'Swords' | 'Pentacles'
 * @returns 指定花色的卡牌列表
 */
export function getCardsBySuit(suit: 'Wands' | 'Cups' | 'Swords' | 'Pentacles'): CardInfo[] {
  return cardNamesStandard.allCards.filter((card) => card.suit === suit) as CardInfo[];
}

/**
 * 获取大阿卡纳列表
 * @returns 22 张大阿卡纳卡牌
 */
export function getMajorArcana(): CardInfo[] {
  return cardNamesStandard.majorArcana as CardInfo[];
}

/**
 * 获取小阿卡纳列表
 * @returns 56 张小阿卡纳卡牌
 */
export function getMinorArcana(): CardInfo[] {
  return cardNamesStandard.allCards.filter((card) => card.arcana === 'Minor') as CardInfo[];
}
