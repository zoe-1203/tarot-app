/**
 * @deprecated 已废弃，请使用 generateVisionPromptWithCardCount() 替代
 * 塔罗牌图片识别 Prompt（支持多张牌）- 中文版
 */

export const VISION_RECOGNITION_PROMPT = `你是一个专业的塔罗牌识别专家，精通韦特塔罗牌（Rider-Waite-Smith Tarot）的所有 78 张牌。
现在用户已经随机抽出了几张塔罗牌，你的任务是识别并告诉我这些牌的牌名和正逆位。

**任务**：
观察图片中的所有塔罗牌，从左到右（或从上到下）依次识别每张牌的牌名和正逆位。
你能在所有应用场景识别塔罗牌，即使上面有未翻开的塔罗牌，你只需要识别已翻开的塔罗牌即可。

你在识别牌时，需要仔细查看牌的上方或者下方的英文是正位还是逆位。


**输出格式**：
请严格按照以下 JSON 格式输出，不要输出其他内容：
\`\`\`json
{
  "cards": [
    {
      "position": 1,
      "cardNameCn": "中文牌名",
      "cardNameEn": "English Card Name（请输出英文，不要罗马数字或数字）",
      "orientation": "upright 或 reversed",
      "confidence": "high / medium / low",
      "analysisWhichCard": "分析这个牌是哪张塔罗牌的依据"
    },
    {
      "position": 2,
      "cardNameCn": "中文牌名",
      "cardNameEn": "English Card Name",
      "orientation": "upright 或 reversed",
      "confidence": "high / medium / low",
      "analysisWhichCard": "分析这个牌是哪张塔罗牌的依据"
    },
    ...
  ],
  "totalCards": 2,
  "reason": "识别依据的简要说明"
}
\`\`\`

**塔罗牌列表**：

大阿卡纳（22张）：
0 愚人 The Fool, I 魔术师 The Magician, II 女祭司 The High Priestess, III 女皇 The Empress, IV 皇帝 The Emperor, V 教皇 The Hierophant, VI 恋人 The Lovers, VII 战车 The Chariot, VIII 力量 Strength, IX 隐士 The Hermit, X 命运之轮 Wheel of Fortune, XI 正义 Justice, XII 倒吊人 The Hanged Man, XIII 死神 Death, XIV 节制 Temperance, XV 恶魔 The Devil, XVI 塔 The Tower, XVII 星星 The Star, XVIII 月亮 The Moon, XIX 太阳 The Sun, XX 审判 Judgement, XXI 世界 The World

小阿卡纳（56张）：
- 权杖 Wands: Ace-10 + 侍从Page/骑士Knight/王后Queen/国王King
- 圣杯 Cups: Ace-10 + 侍从Page/骑士Knight/王后Queen/国王King
- 宝剑 Swords: Ace-10 + 侍从Page/骑士Knight/王后Queen/国王King
- 星币 Pentacles: Ace-10 + 侍从Page/骑士Knight/王后Queen/国王King

比如：

**正逆位判断方法**：
- upright（正位）：图案正立，人物或主要图案朝上
- reversed（逆位）：图案倒置，人物或主要图案朝下

**注意**：
1. 按照图片中牌的排列顺序（从左到右，从上到下）依次识别
2. position 从 1 开始编号
3. 如果某张牌模糊或无法确定，confidence 设为 "low"，但仍尽量给出最可能的牌名
4. 如果图片中没有塔罗牌，cards 数组为空，totalCards 为 0
5. 只输出 JSON，不要有其他文字`;

/**
 * 生成带 cardCount 参数的 Prompt
 * @param cardCount - 卡牌数量，可以是固定数字（如 "3", "5", "7"）或范围（如 "1~12"）
 * @returns 完整的识别 Prompt
 */
export function generateVisionPromptWithCardCount(cardCount: string): string {
  // 解析 cardCount 参数
  let countHint: string;

  if (cardCount.includes('~')) {
    // 范围模式：如 "1~13" 表示最多 13 张//改成最多22张
    const maxCount = cardCount.split('~')[1];
    countHint = `图片中最多有 ${maxCount} 张塔罗牌`;
  } else {
    // 固定值模式：如 "3"、"5"、"7"
    countHint = `图片中有 ${cardCount} 张塔罗牌`;
  }

  return `你是一个专业的塔罗牌识别专家，精通韦特塔罗牌（Rider-Waite-Smith Tarot）的所有 78 张牌。
现在用户已经随机抽出了几张塔罗牌，${countHint}，你的任务是识别并告诉我这些牌的牌名和正逆位。

**重要提示**：如果实际观察到的牌数与上述数量不符，请以实际观察为准。

**任务**：
观察图片中的所有塔罗牌，从左到右（或从上到下）依次识别每张牌的牌名和正逆位。
你能在所有应用场景识别塔罗牌，即使上面有未翻开的塔罗牌，你只需要识别已翻开的塔罗牌即可。

你在识别牌时，需要仔细核对牌面是否是对应牌，因为罗马数字可能看不清或者看错。


**输出格式**：
请严格按照以下 JSON 格式输出，不要输出其他内容：
\`\`\`json
{
  "cards": [
    {
      "position": 1,
      "cardNameCn": "中文牌名",
      "cardNameEn": "English Card Name（请输出纯英文！不要罗马数字或阿拉伯数字）",
      "orientation": "upright 或 reversed",
      "confidence": "high / medium / low",
      "analysisWhichCard": "分析这个牌是哪张塔罗牌的依据"
    },
    {
      "position": 2,
      "cardNameCn": "中文牌名",
      "cardNameEn": "English Card Name",
      "orientation": "upright 或 reversed",
      "confidence": "high / medium / low",
      "analysisWhichCard": "分析这个牌是哪张塔罗牌的依据"
    },
    ...
  ],
  "totalCards": 2,
  "reason": "识别依据的简要说明"
}
\`\`\`

**塔罗牌列表**：

大阿卡纳（22张）：
0 愚人 The Fool, I 魔术师 The Magician, II 女祭司 The High Priestess, III 女皇 The Empress, IV 皇帝 The Emperor, V 教皇 The Hierophant, VI 恋人 The Lovers, VII 战车 The Chariot, VIII 力量 Strength, IX 隐士 The Hermit, X 命运之轮 Wheel of Fortune, XI 正义 Justice, XII 倒吊人 The Hanged Man, XIII 死神 Death, XIV 节制 Temperance, XV 恶魔 The Devil, XVI 塔 The Tower, XVII 星星 The Star, XVIII 月亮 The Moon, XIX 太阳 The Sun, XX 审判 Judgement, XXI 世界 The World

小阿卡纳（56张）：
- 权杖 Wands: Ace-10 + 侍从Page/骑士Knight/王后Queen/国王King
- 圣杯 Cups: Ace-10 + 侍从Page/骑士Knight/王后Queen/国王King
- 宝剑 Swords: Ace-10 + 侍从Page/骑士Knight/王后Queen/国王King
- 星币 Pentacles: Ace-10 + 侍从Page/骑士Knight/王后Queen/国王King

比如：

**正逆位判断方法**：
- upright（正位）：图案正立，人物或主要图案朝上
- reversed（逆位）：图案倒置，人物或主要图案朝下

**注意**：
1. 按照图片中牌的排列顺序（从左到右，从上到下）依次识别
2. position 从 1 开始编号
3. 如果某张牌模糊或无法确定，confidence 设为 "low"，但仍尽量给出最可能的牌名
4. 如果图片中没有塔罗牌，cards 数组为空，totalCards 为 0
5. 只输出 JSON，不要有其他文字`;
}

/**
 * 单张牌的识别结果
 */
export interface CardRecognitionResult {
  position: number;
  cardNameCn: string | null;
  cardNameEn: string | null;
  orientation: 'upright' | 'reversed' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  analysisWhichCard?: string;
}

/**
 * 多张牌的识别结果
 */
export interface VisionRecognitionResult {
  cards: CardRecognitionResult[];
  totalCards: number;
  reason: string;
}

/**
 * 解析视觉模型的 JSON 响应（多张牌）
 */
export function parseVisionJsonResponse(response: string): VisionRecognitionResult {
  // 尝试提取 JSON
  const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
                    response.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    try {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // 新格式：多张牌
      if (parsed.cards && Array.isArray(parsed.cards)) {
        const cards: CardRecognitionResult[] = parsed.cards.map((card: Record<string, unknown>, index: number) => ({
          position: typeof card.position === 'number' ? card.position : index + 1,
          cardNameCn: typeof card.cardNameCn === 'string' ? card.cardNameCn : null,
          cardNameEn: typeof card.cardNameEn === 'string' ? card.cardNameEn : null,
          orientation: card.orientation === 'reversed' ? 'reversed' :
                       card.orientation === 'upright' ? 'upright' : 'unknown',
          confidence: ['high', 'medium', 'low'].includes(card.confidence as string)
                      ? (card.confidence as 'high' | 'medium' | 'low') : 'medium',
          analysisWhichCard: typeof card.analysisWhichCard === 'string' ? card.analysisWhichCard : undefined,
        }));

        return {
          cards,
          totalCards: typeof parsed.totalCards === 'number' ? parsed.totalCards : cards.length,
          reason: typeof parsed.reason === 'string' ? parsed.reason : '',
        };
      }

      // 兼容旧格式：单张牌
      if (parsed.cardNameCn || parsed.cardNameEn) {
        return {
          cards: [{
            position: 1,
            cardNameCn: parsed.cardNameCn || null,
            cardNameEn: parsed.cardNameEn || null,
            orientation: parsed.orientation === 'reversed' ? 'reversed' :
                         parsed.orientation === 'upright' ? 'upright' : 'unknown',
            confidence: ['high', 'medium', 'low'].includes(parsed.confidence)
                        ? parsed.confidence : 'medium',
          }],
          totalCards: 1,
          reason: parsed.reason || '',
        };
      }
    } catch {
      // JSON 解析失败，使用回退逻辑
    }
  }

  // 回退：尝试从文本中提取信息
  const cards: CardRecognitionResult[] = [];

  // 尝试匹配多个牌名
  const cardMatches = response.matchAll(/(?:第?\s*(\d+)\s*[张:：]?\s*)?牌名[：:]\s*(.+?)\s*[\/\\]\s*(.+?)(?:\n|$)/g);

  let position = 1;
  for (const match of cardMatches) {
    const pos = match[1] ? parseInt(match[1]) : position;
    const cardNameCn = match[2].trim();
    const cardNameEn = match[3].trim();

    // 检查这张牌附近的正逆位
    const context = response.substring(Math.max(0, match.index! - 50), match.index! + match[0].length + 50);
    let orientation: 'upright' | 'reversed' | 'unknown' = 'unknown';
    if (context.includes('逆位') || context.toLowerCase().includes('reversed')) {
      orientation = 'reversed';
    } else if (context.includes('正位') || context.toLowerCase().includes('upright')) {
      orientation = 'upright';
    }

    cards.push({
      position: pos,
      cardNameCn,
      cardNameEn,
      orientation,
      confidence: 'low',
    });

    position++;
  }

  // 如果没有匹配到多张，尝试匹配单张
  if (cards.length === 0) {
    const singleMatch = response.match(/牌名[：:]\s*(.+?)\s*[\/\\]\s*(.+?)(?:\n|$)/);
    if (singleMatch) {
      let orientation: 'upright' | 'reversed' | 'unknown' = 'unknown';
      if (response.includes('逆位') || response.toLowerCase().includes('reversed')) {
        orientation = 'reversed';
      } else if (response.includes('正位') || response.toLowerCase().includes('upright')) {
        orientation = 'upright';
      }

      cards.push({
        position: 1,
        cardNameCn: singleMatch[1].trim(),
        cardNameEn: singleMatch[2].trim(),
        orientation,
        confidence: 'low',
      });
    }
  }

  return {
    cards,
    totalCards: cards.length,
    reason: cards.length === 0 ? 'Failed to parse response' : 'Parsed from text fallback',
  };
}

/**
 * @deprecated 已废弃，请使用 generateVisionPromptWithCardCountEN() 替代
 * 塔罗牌图片识别 Prompt（支持多张牌）- 英文版
 * English version for overseas models (Gemini, GPT-4, etc.)
 */

export const VISION_RECOGNITION_PROMPT_EN = `You are a professional Tarot card recognition expert, proficient in all 78 cards of the Rider-Waite-Smith Tarot.

The user has randomly drawn several Tarot cards. Your task is to identify the card names and their orientations (upright or reversed).

**Task**:
Observe all Tarot cards in the image and identify each card's name and orientation sequentially from left to right (or top to bottom).
You can recognize Tarot cards in all application scenarios. Even if there are unturned cards in the image, you only need to identify the visible cards.

When identifying cards, carefully check whether the English text at the top or bottom of each card is upright or inverted to determine orientation.

**Output Format**:
Please strictly follow this JSON format and output nothing else:
\`\`\`json
{
  "cards": [
    {
      "position": 1,
      "cardNameCn": "Chinese card name",
      "cardNameEn": "English Card Name (output pure English text, NO Roman numerals or Arabic numbers)",
      "orientation": "upright or reversed",
      "confidence": "high / medium / low",
      "analysisWhichCard": "Reasoning for identifying this specific card"
    },
    {
      "position": 2,
      "cardNameCn": "Chinese card name",
      "cardNameEn": "English Card Name",
      "orientation": "upright or reversed",
      "confidence": "high / medium / low",
      "analysisWhichCard": "Reasoning for identifying this specific card"
    },
    ...
  ],
  "totalCards": 2,
  "reason": "Brief explanation of identification rationale"
}
\`\`\`

**Tarot Card List**:

Major Arcana (22 cards):
0 The Fool, I The Magician, II The High Priestess, III The Empress, IV The Emperor, V The Hierophant, VI The Lovers, VII The Chariot, VIII Strength, IX The Hermit, X Wheel of Fortune, XI Justice, XII The Hanged Man, XIII Death, XIV Temperance, XV The Devil, XVI The Tower, XVII The Star, XVIII The Moon, XIX The Sun, XX Judgement, XXI The World

Minor Arcana (56 cards):
- Wands: Ace through Ten + Page/Knight/Queen/King
- Cups: Ace through Ten + Page/Knight/Queen/King
- Swords: Ace through Ten + Page/Knight/Queen/King
- Pentacles: Ace through Ten + Page/Knight/Queen/King

**Orientation Determination Method**:
- upright: Image is right-side up, figures or main imagery face upward
- reversed: Image is upside down, figures or main imagery face downward

**Important Notes**:
1. Identify cards according to their arrangement in the image (left to right, top to bottom)
2. Position numbering starts from 1
3. If a card is blurry or uncertain, set confidence to "low" but still provide the most likely card name
4. If there are no Tarot cards in the image, the cards array should be empty and totalCards should be 0
5. Output only JSON, no additional text`;

/**
 * 生成带 cardCount 参数的 Prompt - 英文版
 * @param cardCount - 卡牌数量，可以是固定数字（如 "3", "5", "7"）或范围（如 "1~12"）
 * @returns 完整的识别 Prompt（英文）
 */
export function generateVisionPromptWithCardCountEN(cardCount: string): string {
  // 解析 cardCount 参数
  let countHint: string;

  if (cardCount.includes('~')) {
    // 范围模式：如 "1~13" 表示最多 13 张
    const maxCount = cardCount.split('~')[1];
    countHint = `The image contains at most ${maxCount} Tarot cards`;
  } else {
    // 固定值模式：如 "3"、"5"、"7"
    countHint = `The image contains ${cardCount} Tarot cards`;
  }

  return `You are a professional Tarot card recognition expert, proficient in all 78 cards of the Rider-Waite-Smith Tarot.
The user has randomly drawn several Tarot cards. ${countHint}. Your task is to identify the card names and their orientations (upright or reversed).

**Important Note**: If the actual number of cards observed differs from the count mentioned above, please prioritize what you observe.

**Task**:
Observe all Tarot cards in the image and identify each card's name and orientation sequentially from left to right (or top to bottom).
You can recognize Tarot cards in all application scenarios. Even if there are unturned cards in the image, you only need to identify the visible cards.

When identifying cards, carefully verify the card face matches the expected card, as Roman numerals may be unclear or misread.

**Output Format**:
Please strictly follow this JSON format and output nothing else:
\`\`\`json
{
  "cards": [
    {
      "position": 1,
      "cardNameCn": "Chinese card name",
      "cardNameEn": "English Card Name (output pure English text! NO Roman numerals or Arabic numbers)",
      "orientation": "upright or reversed",
      "confidence": "high / medium / low",
      "analysisWhichCard": "Reasoning for identifying this specific card"
    },
    {
      "position": 2,
      "cardNameCn": "Chinese card name",
      "cardNameEn": "English Card Name",
      "orientation": "upright or reversed",
      "confidence": "high / medium / low",
      "analysisWhichCard": "Reasoning for identifying this specific card"
    },
    ...
  ],
  "totalCards": 2,
  "reason": "Brief explanation of identification rationale"
}
\`\`\`

**Tarot Card List**:

Major Arcana (22 cards):
0 The Fool, I The Magician, II The High Priestess, III The Empress, IV The Emperor, V The Hierophant, VI The Lovers, VII The Chariot, VIII Strength, IX The Hermit, X Wheel of Fortune, XI Justice, XII The Hanged Man, XIII Death, XIV Temperance, XV The Devil, XVI The Tower, XVII The Star, XVIII The Moon, XIX The Sun, XX Judgement, XXI The World

Minor Arcana (56 cards):
- Wands: Ace through Ten + Page/Knight/Queen/King
- Cups: Ace through Ten + Page/Knight/Queen/King
- Swords: Ace through Ten + Page/Knight/Queen/King
- Pentacles: Ace through Ten + Page/Knight/Queen/King

**Orientation Determination Method**:
- upright: Image is right-side up, figures or main imagery face upward
- reversed: Image is upside down, figures or main imagery face downward

**Important Notes**:
1. Identify cards according to their arrangement in the image (left to right, top to bottom)
2. Position numbering starts from 1
3. If a card is blurry or uncertain, set confidence to "low" but still provide the most likely card name
4. If there are no Tarot cards in the image, the cards array should be empty and totalCards should be 0
5. Output only JSON, no additional text`;
}
