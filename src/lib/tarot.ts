import { tarotCards } from './cards';
import { getPromptTemplate } from './prompt-templates';

/**
 * 获取所有可选的塔罗牌列表（供手动选牌使用）
 */
export interface CardOption {
  enName: string;
  cnName: string;
  arcana: 'Major' | 'Minor';
  rank: 'Court' | 'Number' | null;
}

export function getAllCardOptions(): CardOption[] {
  return tarotCards.slice(0, 78).map(card => ({
    enName: card.enName,
    cnName: card.cnName,
    arcana: card.arcana as 'Major' | 'Minor',
    rank: card.rank as 'Court' | 'Number' | null,
  }));
}

/**
 * 将数字转换为中文数字
 */
function numberToChinese(num: number): string {
  const numbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  if (num <= 0 || num > 10) return String(num);
  return numbers[num];
}

/**
 * 将数字转换为英文序号
 */
function numberToEnglish(num: number): string {
  const words = [
    '', 'One', 'Two', 'Three', 'Four', 'Five',
    'Six', 'Seven', 'Eight', 'Nine', 'Ten'
  ];
  if (num <= 0 || num > 10) return String(num);
  return words[num];
}

/**
 * 根据牌名查找完整牌意
 * @param cardName 牌的英文名 (如 'The Fool') 或中文名 (如 '愚者')
 * @param language 'cn' | 'en' 或 '中文' | 'English'
 * @returns 对应语言的完整牌意文本
 */
function getCardMeaning(cardName: string, language: string): string {
  const lang = language === '中文' || language === 'cn' ? 'cn' : 'en';

  // 尝试通过 enName 或 cnName 匹配
  const card = tarotCards.find(
    c => c.enName === cardName || c.cnName === cardName
  );

  if (!card) {
    return lang === 'cn' ? '（牌意信息未找到）' : '(Card meaning not found)';
  }

  return lang === 'cn' ? card.cn : card.en;
}

export interface DrawnCard {
  enName: string;
  cnName: string;
  isUpright: boolean; // true = 正位, false = 逆位
  arcana?: 'Major' | 'Minor';
  rank?: 'Court' | 'Number' | null;
}

export interface TarotResult {
  index: number;
  question: string;
  drawnCards: DrawnCard[];
  cardListText: string;
  systemPrompt: string;
  response: string;
  timestamp: string;
  label?: string;  // "有牌意" 或 "无牌意" (用于对比模式)
}

export interface ModelResult {
  modelId: string;
  modelName: string;
  calls: TarotResult[];
  stats: {
    totalCalls: number;
    successCalls: number;
    failedCalls: number;
  };
  error?: string;
}

export interface MultiModelResponse {
  results: Record<string, ModelResult>;
  sharedCards: DrawnCard[];
  metadata: {
    totalTime: number;
    timestamp: string;
  };
  error?: string;
}

/**
 * 从 78 张牌中随机抽取指定数量的牌
 */
export function drawCards(count: number): DrawnCard[] {
  // 去重：只取前 78 张（cards.ts 里可能有重复数据）
  const uniqueCards = tarotCards.slice(0, 78);

  // Fisher-Yates 洗牌
  const shuffled = [...uniqueCards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 抽取指定数量，并随机决定正/逆位
  return shuffled.slice(0, Math.min(count, 78)).map(card => ({
    enName: card.enName,
    cnName: card.cnName,
    isUpright: Math.random() > 0.5,
    arcana: card.arcana as 'Major' | 'Minor',
    rank: card.rank as 'Court' | 'Number' | null,
  }));
}

/**
 * 格式化抽到的牌列表
 * 例如: "正位的 The Fool, 逆位的 The Magician"
 */
export function formatCardList(drawnCards: DrawnCard[]): string {
  return drawnCards
    .map(({ enName, isUpright }) =>
      `${isUpright ? '正位' : '逆位'}的 ${enName}`
    )
    .join(', ');
}

export interface PromptConfig {
  question: string;
  cardCount: number;
  drawnCards: DrawnCard[];
  hookQuestion?: string;
  additionalQuestionTextInfo?: string;
  cardLayoutName?: string;
  cardPatternLayoutAnalysis?: string;
  timeInfo?: string;
  language?: string;
  patternPositions?: Array<{
    name: string;
    description: string;
  }>;
  includeCardMeaning?: boolean;
}

/**
 * 获取牌型标注文本
 * @param card 抽到的牌
 * @param language 'cn' | 'en' 或 '中文' | 'English'
 * @returns 牌型标注文本，如 "这是一张大阿卡纳牌。" 或空字符串
 */
function getCardTypeLabel(card: DrawnCard, language: string): string {
  const isChinese = language === '中文' || language === 'cn';

  if (card.arcana === 'Major') {
    return isChinese ? '这是一张大阿卡纳牌。' : 'This is a Major Arcana card.';
  }

  if (card.arcana === 'Minor' && card.rank === 'Court') {
    return isChinese ? '这是一张宫廷牌。' : 'This is a Court card.';
  }

  // 普通数字牌不添加标注
  return '';
}

/**
 * 构建 System Prompt
 */
export function buildSystemPrompt(config: PromptConfig): string {
  const {
    question,
    cardCount,
    drawnCards,
    hookQuestion = '',
    additionalQuestionTextInfo = '',
    cardLayoutName = '自由牌阵',
    cardPatternLayoutAnalysis = '这是一个自由牌阵，每张牌的位置都代表着问题的不同方面。',
    timeInfo = `当前时间：${new Date().toLocaleDateString('zh-CN')}`,
    language = '中文',
    patternPositions,
    includeCardMeaning = true
  } = config;

  // 获取对应语言的模板
  const template = getPromptTemplate(language);
  const isChinese = language === '中文' || language === 'cn';

  // 构建牌阵内容信息（增强版）
  let cardLayoutContent: string;

  if (!includeCardMeaning) {
    // 不拼接牌意 - 使用结构化格式但不含牌意
    if (patternPositions && patternPositions.length === drawnCards.length) {
      // 有牌阵位置信息 - 使用完整结构但无牌意
      cardLayoutContent = drawnCards.map((card, index) => {
        const position = patternPositions[index];
        const serialNumber = isChinese ? numberToChinese(index + 1) : numberToEnglish(index + 1);
        const orientation = isChinese
          ? (card.isUpright ? '正位' : '逆位')
          : (card.isUpright ? 'Upright' : 'Reversed');
        const cardName = isChinese ? card.cnName : card.enName;
        const typeLabel = getCardTypeLabel(card, language);

        // 中文格式
        if (isChinese) {
          return `## ${serialNumber}: ${position.name}。${position.description}。在${position.name}的位置，抽到了${orientation}的${cardName}。${typeLabel}`;
        }

        // 英文格式
        return `## ${serialNumber}: ${position.name}. ${position.description}. In the ${position.name} position, drew ${orientation} ${cardName}. ${typeLabel}`;
      }).join('\n\n');
    } else {
      // 无牌阵位置信息 - 使用简化格式但仍用中文数字
      cardLayoutContent = drawnCards.map((card, index) => {
        const serialNumber = isChinese ? numberToChinese(index + 1) : numberToEnglish(index + 1);
        const orientation = isChinese
          ? (card.isUpright ? '正位' : '逆位')
          : (card.isUpright ? 'Upright' : 'Reversed');
        const cardName = isChinese ? card.cnName : card.enName;
        const typeLabel = getCardTypeLabel(card, language);

        if (isChinese) {
          return `第${serialNumber}张牌：${orientation}的${cardName}。${typeLabel}`;
        }

        return `Card ${serialNumber}: ${orientation} ${cardName}. ${typeLabel}`;
      }).join('\n\n');
    }
  } else if (patternPositions && patternPositions.length === drawnCards.length) {
    // 有牌阵位置信息 + 拼接牌意 - 使用完整格式
    cardLayoutContent = drawnCards.map((card, index) => {
      const position = patternPositions[index];
      const serialNumber = isChinese ? numberToChinese(index + 1) : numberToEnglish(index + 1);
      const orientation = isChinese
        ? (card.isUpright ? '正位' : '逆位')
        : (card.isUpright ? 'Upright' : 'Reversed');
      const cardName = isChinese ? card.cnName : card.enName;
      const cardMeaning = getCardMeaning(card.enName, language);
      const typeLabel = getCardTypeLabel(card, language);

      // 中文格式
      if (isChinese) {
        return `## ${serialNumber}: ${position.name}。${position.description}。在${position.name}的位置，抽到了${orientation}的${cardName}。${typeLabel}它的含义是：${cardName}\n牌面图案：\n${cardMeaning}`;
      }

      // 英文格式
      return `## ${serialNumber}: ${position.name}. ${position.description}. In the ${position.name} position, drew ${orientation} ${cardName}. ${typeLabel}Its meaning is: ${cardName}\nCard image:\n${cardMeaning}`;
    }).join('\n\n');
  } else {
    // 无牌阵位置信息 + 拼接牌意 - 使用简化格式但仍拼接牌意
    cardLayoutContent = drawnCards.map((card, index) => {
      const serialNumber = isChinese ? numberToChinese(index + 1) : numberToEnglish(index + 1);
      const orientation = isChinese
        ? (card.isUpright ? '正位' : '逆位')
        : (card.isUpright ? 'Upright' : 'Reversed');
      const cardName = isChinese ? card.cnName : card.enName;
      const cardMeaning = getCardMeaning(card.enName, language);
      const typeLabel = getCardTypeLabel(card, language);

      if (isChinese) {
        return `第${serialNumber}张牌：${orientation}的${cardName}。${typeLabel}它的含义是：${cardName}\n牌面图案：\n${cardMeaning}`;
      }

      return `Card ${serialNumber}: ${orientation} ${cardName}. ${typeLabel}Its meaning is: ${cardName}\nCard image:\n${cardMeaning}`;
    }).join('\n\n');
  }

  // 替换模板中的所有占位符
  return template
    .replace(/\{\{cardCount\}\}/g, String(cardCount))
    .replace(/\{\{question\}\}/g, question)
    .replace(/\{\{hookQuestion\}\}/g, hookQuestion || (isChinese ? '（无背景问题）' : '(No background question)'))
    .replace(/\{\{additionalQuestionTextInfo\}\}/g, additionalQuestionTextInfo || (isChinese ? '（无额外背景信息）' : '(No additional background information)'))
    .replace(/\{\{cardLayoutName\}\}/g, cardLayoutName)
    .replace(/\{\{cardPatternLayoutAnalysis\}\}/g, cardPatternLayoutAnalysis)
    .replace(/\{\{cardLayoutContent\}\}/g, cardLayoutContent)
    .replace(/\{\{timeInfo\}\}/g, timeInfo)
    .replace(/\{\{language\}\}/g, language);
}
