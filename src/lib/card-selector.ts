// 卡牌选择器工具 - 用于人工校对界面

import { tarotCards } from './cards';

// 卡牌选项 (用于下拉选择)
export interface CardOption {
  cnName: string;
  enName: string;
  key: string;
}

// 获取所有78张塔罗牌的名称列表 (不包括正逆位)
export function getAllCardOptions(): CardOption[] {
  return tarotCards.map(card => ({
    cnName: card.cnName,
    enName: card.enName,
    key: card.key,
  }));
}

// 根据中文名查找卡牌
export function findCardByCnName(cnName: string): CardOption | undefined {
  const card = tarotCards.find(c => c.cnName === cnName);
  if (!card) return undefined;

  return {
    cnName: card.cnName,
    enName: card.enName,
    key: card.key,
  };
}

// 根据英文名查找卡牌
export function findCardByEnName(enName: string): CardOption | undefined {
  const card = tarotCards.find(c => c.enName === enName);
  if (!card) return undefined;

  return {
    cnName: card.cnName,
    enName: card.enName,
    key: card.key,
  };
}

// 搜索卡牌 (支持中英文模糊搜索)
export function searchCards(query: string): CardOption[] {
  if (!query || query.trim() === '') {
    return getAllCardOptions();
  }

  const lowerQuery = query.toLowerCase().trim();

  return tarotCards
    .filter(card => {
      return (
        card.cnName.includes(query) ||
        card.enName.toLowerCase().includes(lowerQuery) ||
        card.key.toLowerCase().includes(lowerQuery)
      );
    })
    .map(card => ({
      cnName: card.cnName,
      enName: card.enName,
      key: card.key,
    }));
}

// 验证卡牌名称是否存在
export function isValidCardName(cnName: string): boolean {
  return tarotCards.some(card => card.cnName === cnName);
}

// 获取卡牌的完整显示名称 (含正逆位)
export function getCardDisplayName(
  cnName: string,
  orientation: 'upright' | 'reversed'
): string {
  const orientationText = orientation === 'upright' ? '正位' : '逆位';
  return `${cnName} (${orientationText})`;
}
