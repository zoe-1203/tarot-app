import { patternListCN } from './pattern';
import { descriptionsCn, descriptionsEn } from './cards-layouts';

export interface LayoutOption {
  id: string;
  name: string;        // 牌阵名称
  cardCount: number;   // 该牌阵需要的牌数
  scenario: string;    // 适用场景
}

/**
 * 获取所有可用牌阵选项（中文）
 */
export function getLayoutOptionsCN(): LayoutOption[] {
  return patternListCN.map(item => ({
    id: item.id,
    name: item.pattern,
    cardCount: item.patternData.length,
    scenario: item.scenario
  }));
}

/**
 * 获取牌阵的解读思路模板
 * @param layoutId 牌阵ID
 * @param language 语言 'cn' | 'en'
 * @returns 解读思路模板字符串
 */
export function getLayoutDescription(
  layoutId: string,
  language: 'cn' | 'en' = 'cn'
): string {
  const descriptions = language === 'cn' ? descriptionsCn : descriptionsEn;
  return descriptions[layoutId.toUpperCase() as keyof typeof descriptions] || '';
}

/**
 * 获取牌阵详细信息（包括位置定义）
 */
export function getLayoutDetails(layoutId: string) {
  const layout = patternListCN.find(item => item.id === layoutId);
  if (!layout) return null;

  return {
    id: layout.id,
    name: layout.pattern,
    cardCount: layout.patternData.length,
    positions: layout.patternData.map(p => ({
      name: p.name,
      description: p.desc
    })),
    scenario: layout.scenario
  };
}

/**
 * 替换解读思路中的模板变量
 * @param template 模板字符串
 * @param params 参数对象
 */
export function fillLayoutTemplate(
  template: string,
  params: {
    question?: string;
    cardNum?: number;
  }
): string {
  let result = template;

  // 替换 {{question}}
  if (params.question) {
    result = result.replace(/\{\{question\}\}/g, params.question);
  }

  // 替换 {{cardNum}}（如果存在）
  if (params.cardNum !== undefined) {
    result = result.replace(/\{\{cardNum\}\}/g, String(params.cardNum));
  }

  return result;
}

/**
 * 构建完整的牌阵解读分析文本
 * 包括牌阵介绍 + 位置定义
 */
export function buildPatternLayoutAnalysis(
  layoutId: string,
  language: 'cn' | 'en' = 'cn',
  question?: string
): string {
  const layout = getLayoutDetails(layoutId);
  if (!layout) return '';

  const description = getLayoutDescription(layoutId, language);
  const filledDescription = fillLayoutTemplate(description, {
    question,
    cardNum: layout.cardCount
  });

  // 构建位置说明
  const positionsText = layout.positions
    .map((p, i) => `第${i + 1}张牌（${p.name}位置）：${p.description}`)
    .join('\n');

  return `${filledDescription}\n\n## 牌阵位置说明\n${positionsText}`;
}
