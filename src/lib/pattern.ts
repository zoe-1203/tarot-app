export interface PatternData {
  name: string
  desc: string
}

export interface PatternListItem {
  id: string
  pattern: string
  alias?: string
  patternData: PatternData[]
  scenario: string
}

export enum Locale {
  ChineseSimplified = 'chinese simplified',
  ChineseTraditional = 'chinese traditional',
  English = 'english',
  Japanese = 'japanese',
  Korean = 'korean',
  Spanish = 'spanish',
}

export const patternListCN = [
  {
    id: 'S',
    pattern: '0',
    patternData: [],
    scenario: '适合快速决策',
  },
  {
    id: 'ABS',
    pattern: '选 A 的发展-选 B 的发展 - 建议牌阵',
    patternData: [
      {
        name: '选 A 的发展',
        desc: '选 A 会带来的影响',
      },
      {
        name: '选 B 的发展',
        desc: '选 B 会带来的影响',
      },
      {
        name: '建议',
        desc: '整体方向或具体的行动建议',
      },
    ],
    scenario: '适合面临两个选择时，帮助用户分析两个选择可能的发展趋势',
  },
  {
    id: 'ABCS',
    pattern: '选 A 的发展-选 B 的发展 - 选 C 的发展 - 建议牌阵',
    patternData: [
      {
        name: '选 A 的发展',
        desc: '选 A 会带来的影响',
      },
      {
        name: '选 B 的发展',
        desc: '选 B 会带来的影响',
      },
      {
        name: '选 C 的发展',
        desc: '选 C 会带来的影响',
      },
      {
        name: '建议',
        desc: '整体方向或具体的行动建议',
      },
    ],
    scenario: '适合当用户需要在三个选项间做决策时，分析每个选项可能的发展趋势',
  },
  {
    id: 'TOG',
    pattern: '今日气场 - 穿搭风格 - 玄学指引牌阵',
    patternData: [
      {
        name: '今日气场',
        desc: '代表今天的整体氛围、能量',
      },
      {
        name: '穿衣风格',
        desc: '适合今天的服装风格',
      },
      {
        name: '玄学指引',
        desc: '推荐的颜色或关键单品',
      },
    ],
    scenario: '适合用户每日出门前，提供当天运势相关的穿搭风格建议',
  },
  {
    id: 'BNS',
    pattern: '购入影响-放弃影响-建议牌阵',
    patternData: [
      {
        name: '购入影响',
        desc: '购买后可能带来的结果或影响',
      },
      {
        name: '放弃影响',
        desc: '不购买可能带来的结果或影响',
      },
      {
        name: '建议',
        desc: '具体的购买决策建议',
      },
    ],
    scenario: '适合用户在购物纠结时，分析购买或放弃物品所带来的潜在影响',
  },
  {
    id: 'SAO',
    pattern: '情景-行动-结果牌阵',
    patternData: [
      {
        name: '情景',
        desc: '当前的环境或问题背景',
      },
      {
        name: '行动',
        desc: '需要采取的措施或当前的行动方向',
      },
      {
        name: '结果',
        desc: '如果采取行动，可能会得到的结果或影响',
      },
    ],
    scenario: '适合评估特定情境下采取行动的后果',
  },
  {
    id: 'PPF',
    pattern: '过去-现在-未来牌阵',
    patternData: [
      {
        name: '过去',
        desc: '过去发生的事情，以及它对当前状况的影响',
      },
      {
        name: '现在',
        desc: '当前的情境或问题的核心',
      },
      {
        name: '未来',
        desc: '事件可能的走向或潜在的结果',
      },
    ],
    scenario: '适合探索事件的发展趋势',
  },
  {
    id: 'ORA',
    pattern: '阻碍-资源-建议牌阵',
    patternData: [
      {
        name: '阻碍',
        desc: '目前面临的主要障碍或限制',
      },
      {
        name: '帮助',
        desc: '可以利用的优势或资源',
      },
      {
        name: '建议',
        desc: '整体方向或具体的行动建议',
      },
    ],
    scenario: '适合想知道知道某件事的阻碍是什么，以及如何克服',
  },
  {
    id: 'TFA',
    pattern: '思想-情感-行为牌阵',
    patternData: [
      {
        name: '思想',
        desc: '理性层面，关于问题的想法或信念',
      },
      {
        name: '情感',
        desc: '情绪反应或内心的感受',
      },
      {
        name: '行为',
        desc: '外在表现或可能采取的行动',
      },
    ],
    scenario: '适合分析某一个人在思想、情感和行动层面的内在原因或矛盾',
  },
  {
    id: 'MOU',
    pattern: '我-对方-我们牌阵',
    patternData: [
      {
        name: '我',
        desc: '问卜者的角色、行为或感受',
      },
      {
        name: '对方',
        desc: '对方的状态、感受或行为',
      },
      {
        name: '我们',
        desc: '关系整体的能量或未来可能性',
      },
    ],
    scenario: '适合分析两人之间的关系动态',
  },
  {
    id: 'TS',
    pattern: '直指核心牌阵',
    patternData: [
      {
        name: '问题核心',
        desc: '解析问题的核心本质或关键点',
      },
      {
        name: '优势资源',
        desc: '问卜者目前可用的优势、条件或支持',
      },
      {
        name: '当前障碍',
        desc: '阻挡问题解决的主要困难或负面因素',
      },
      {
        name: '行动建议',
        desc: '针对问题提出的具体解决方案或方向',
      },
    ],
    scenario: '适合需要快速明确问题根源并找到解决方案的问题',
  },
  {
    id: 'JI',
    pattern: '面试求职牌阵',
    patternData: [
      {
        name: '个人心态',
        desc: '自己在面试前的心态和心理准备',
      },
      {
        name: '面前准备',
        desc: '面试前需要特别关注或准备的事项',
      },
      {
        name: '面试动态',
        desc: '面试中可能发生的情境、交流或互动',
      },
      {
        name: '对方期望',
        desc: '对方对求职者的要求、期望或评判标准',
      },
      {
        name: '潜在结果',
        desc: '面试后的可能结局或潜在发展趋势',
      },
    ],
    scenario: '适合分析面试的走向和注意事项',
  },
  {
    id: 'RD',
    pattern: '关系牌阵',
    patternData: [
      {
        name: '自我',
        desc: '问卜者的态度、需求或状态',
      },
      {
        name: '对方',
        desc: '对方的态度、需求或状态',
      },
      {
        name: '关系现状',
        desc: '两人当前的互动模式',
      },
      {
        name: '潜在问题',
        desc: '关系中隐藏的矛盾或障碍',
      },
      {
        name: '未来走向',
        desc: '关系可能的演变',
      },
    ],
    scenario: '适合分析关系动态和发展方向',
  },
  {
    id: 'LC',
    pattern: '恋人十字牌阵',
    patternData: [
      {
        name: '你的态度',
        desc: '表达你在爱情关系中的真实感受和态度',
      },
      {
        name: '对方态度',
        desc: '描述对方在关系中的感受、态度和行为',
      },
      {
        name: '关系现状',
        desc: '关系的具体情况，互动模式或主要特点',
      },
      {
        name: '存在问题',
        desc: '影响关系发展的主要矛盾或困难',
      },
      {
        name: '未来发展',
        desc: '关系可能的方向或发展趋势',
      },
    ],
    scenario: '适合分析两人关系的走向',
  },
  {
    id: 'GA',
    pattern: '目标达成牌阵',
    patternData: [
      {
        name: '目标',
        desc: '目标的核心意义或本质所在',
      },
      {
        name: '动力',
        desc: '驱动你前进的动力',
      },
      {
        name: '障碍',
        desc: '当前面临的困难或限制',
      },
      {
        name: '资源',
        desc: '达成目标所需的资源或支持',
      },
      {
        name: '结果',
        desc: '实现目标后的状态或成果',
      },
    ],
    scenario: '适合分析目标的实现路径',
  },
  {
    id: 'P',
    pattern: '进展牌阵',
    patternData: [
      {
        name: '当前状态',
        desc: '目前所处的阶段或状态',
      },
      {
        name: '已达成',
        desc: '已取得的进展和成果',
      },
      {
        name: '未达成',
        desc: '尚未解决的问题',
      },
      {
        name: '进展方向',
        desc: '需要努力的方向',
      },
      {
        name: '结果推演',
        desc: '可能的最终结果',
      },
    ],
    scenario: '适合分析某一项目、关系或成长的进展',
  },
  {
    id: 'SG',
    pattern: '灵魂成长牌阵',
    patternData: [
      {
        name: '灵魂状态',
        desc: '当前的灵魂或内心状态',
      },
      {
        name: '成长课题',
        desc: '需要学习的课题或任务',
      },
      {
        name: '成长阻碍',
        desc: '影响成长的障碍',
      },
      {
        name: '助力力量',
        desc: '可以推动成长的力量或资源',
      },
      {
        name: '结果推演',
        desc: '成长后的可能结果',
      },
    ],
    scenario: '适合探索个人灵魂成长的路径',
  },
  {
    id: 'IE',
    pattern: '内在探索牌阵',
    patternData: [
      {
        name: '内心状态',
        desc: '当前的内在情绪或心理状况',
      },
      {
        name: '信念',
        desc: '信念或价值观，驱动行为的隐性因素',
      },
      {
        name: '恐惧',
        desc: '恐惧或压力，可能抑制你的内在力量',
      },
      {
        name: '内在潜能',
        desc: '可以支持你前进的优点或资源',
      },
      {
        name: '成长方向',
        desc: '通过内在探索可以实现的突破或目标',
      },
    ],
    scenario: '适合深入了解自己的内心世界，探索隐藏的情绪、信念和潜力',
  },
  {
    id: 'DM',
    pattern: '决定牌阵',
    patternData: [
      {
        name: '当前状况',
        desc: '当前的情境或状态',
      },
      {
        name: '选择优势',
        desc: '选择的正面因素或优势',
      },
      {
        name: '选择劣势',
        desc: '选择的负面因素或缺点',
      },
      {
        name: '其他因素',
        desc: '未考虑的潜在因素',
      },
      {
        name: '行动建议',
        desc: '根据情况给出的行动建议',
      },
    ],
    scenario: '帮助分析一个具体决定的可行性或利弊',
  },
  {
    id: 'C',
    pattern: '二择一牌阵',
    patternData: [
      {
        name: '需求动机',
        desc: '你的核心需求或动机',
      },
      {
        name: '发展一',
        desc: '选择一的发展方向',
      },
      {
        name: '发展二',
        desc: '选择二的发展方向',
      },
      {
        name: '结果一',
        desc: '选择一的最终结果',
      },
      {
        name: '结果二',
        desc: '选择二的最终结果',
      },
    ],
    scenario: '适合权衡两种选择的发展与结果，帮助做出明确决策',
  },
  {
    id: 'CPS',
    pattern: '事业路径牌阵',
    patternData: [
      {
        name: '当前状态',
        desc: '目前的职业状态或心态',
      },
      {
        name: '阻碍',
        desc: '影响前进的主要障碍或困难',
      },
      {
        name: '优势',
        desc: '在职业发展中的优势或资源',
      },
      {
        name: '潜力',
        desc: '隐藏才能或未被发现的可能性',
      },
      {
        name: '选择',
        desc: '目前可以考虑的选择或路径',
      },
      {
        name: '结果',
        desc: '根据当前路径的可能结果',
      },
      {
        name: '建议',
        desc: '下一步应该采取的行动或策略',
      },
    ],
    scenario: '适合解决学业和职业发展过程中的困惑',
  },
  {
    id: 'TOL',
    pattern: '生命之树牌阵',
    patternData: [
      {
        name: '冠',
        desc: '灵性目标或最终愿景',
      },
      {
        name: '智慧',
        desc: '问卜者的直觉或洞见',
      },
      {
        name: '理解',
        desc: '问卜者的分析或判断',
      },
      {
        name: '慈悲',
        desc: '问卜者的给予与爱',
      },
      {
        name: '力量',
        desc: '问卜者的意志或掌控力',
      },
      {
        name: '美',
        desc: '平衡的核心力量',
      },
      {
        name: '胜利',
        desc: '问卜者的动力与成就',
      },
      {
        name: '荣耀',
        desc: '问卜者的表达或交流',
      },
      {
        name: '基础',
        desc: '问卜者的根基或安全感',
      },
      {
        name: '王国',
        desc: '现实世界中的表现或结果',
      },
    ],
    scenario: '适合探索自我、精神成长及更高层次的意义，只有非常复杂的问题才适合',
  },
  {
    id: 'CC',
    pattern: '凯尔特十字牌阵',
    patternData: [
      {
        name: '现状',
        desc: '当前问题的描述',
      },
      {
        name: '阻碍',
        desc: '影响现状的挑战或矛盾',
      },
      {
        name: '潜意识',
        desc: '问题的深层原因',
      },
      {
        name: '过去',
        desc: '影响现状的过去事件',
      },
      {
        name: '目标',
        desc: '期望或理想结果',
      },
      {
        name: '未来',
        desc: '即将发生的变化或趋势',
      },
      {
        name: '自我状态',
        desc: '你对问题的看法或感受',
      },
      {
        name: '外界环境',
        desc: '他人对问题的影响',
      },
      {
        name: '希望与恐惧',
        desc: '内心的期盼或担忧',
      },
      {
        name: '结果',
        desc: '事情可能的最终发展',
      },
    ],
    scenario: '适合全面分析复杂问题的成因与发展，只有非常复杂的问题才适合',
  },
  {
    id: 'Z',
    pattern: '十二宫牌阵',
    patternData: [
      {
        name: '第一宫（自我）',
        desc: '你的性格、外表或态度',
      },
      {
        name: '第二宫（财富）',
        desc: '财务状况或物质资源',
      },
      {
        name: '第三宫（交流）',
        desc: '沟通、学习或短途旅行',
      },
      {
        name: '第四宫（家庭）',
        desc: '家人、家居或内在情感',
      },
      {
        name: '第五宫（创造力）',
        desc: '爱好、创意或浪漫',
      },
      {
        name: '第六宫（工作）',
        desc: '工作、健康或日常事务',
      },
      {
        name: '第七宫（关系）',
        desc: '伴侣关系或合作',
      },
      {
        name: '第八宫（转化）',
        desc: '转变、共享资源或深层联系',
      },
      {
        name: '第九宫（探索）',
        desc: '学习、旅行或精神追求',
      },
      {
        name: '第十宫（事业）',
        desc: '职业、社会地位或野心',
      },
      {
        name: '第十一宫（社交）',
        desc: '友谊、社团或未来规划',
      },
      {
        name: '第十二宫（潜意识）',
        desc: '隐秘、潜意识或灵性成长',
      },
    ],
    scenario: '涵盖事业、情感、健康等全面的个人生活解读，只有非常复杂的问题才适合',
  },
] as const satisfies PatternListItem[]

export const patternListEN = [
  {
    id: 'S',
    pattern: '0',
    patternData: [],
    scenario: 'Suitable for quick decision.',
  },
  {
    id: 'ABS',
    pattern: 'Development of A-Development of B-Advice Spread',
    patternData: [
      {
        name: 'Development of A',
        desc: 'The impact of choosing A',
      },
      {
        name: 'Development of B',
        desc: 'The impact of choosing B',
      },
      {
        name: 'Advice',
        desc: 'General direction or specific action suggestions',
      },
    ],
    scenario: 'Suitable for analyzing the potential outcomes of two choices when facing a decision.',
  },
  {
    id: 'ABCS',
    pattern: 'Development of A-Development of B-Development of C-Advice Spread',
    patternData: [
      {
        name: 'Development of A',
        desc: 'The impact of choosing A',
      },
      {
        name: 'Development of B',
        desc: 'The impact of choosing B',
      },
      {
        name: 'Development of C',
        desc: 'The impact of choosing C',
      },
      {
        name: 'Advice',
        desc: 'General direction or specific action suggestions',
      },
    ],
    scenario: 'Suitable for decision-making among three options by analyzing the possible outcomes of each.',
  },
  {
    id: 'TOG',
    pattern: "Today's Energy-Outfit Style-Mystical Guidance Spread",
    patternData: [
      {
        name: "Today's Energy",
        desc: 'Overall atmosphere and energy for today',
      },
      {
        name: 'Outfit Style',
        desc: 'Recommended outfit style for today',
      },
      {
        name: 'Mystical Guidance',
        desc: 'Suggested colors or key items',
      },
    ],
    scenario: 'Suitable for providing outfit style recommendations based on daily fortune before going out.',
  },
  {
    id: 'BNS',
    pattern: 'Impact of Purchase-Impact of Giving Up-Advice Spread',
    patternData: [
      {
        name: 'Impact of Purchase',
        desc: 'Possible outcomes or impacts if purchased',
      },
      {
        name: 'Impact of Giving Up',
        desc: 'Possible outcomes or impacts if not purchased',
      },
      {
        name: 'Advice',
        desc: 'Specific recommendations on purchase decisions',
      },
    ],
    scenario: 'Suitable for analyzing the potential impact of purchasing or giving up an item when facing shopping dilemmas.',
  },
  {
    id: 'SAO',
    pattern: 'Situation-Action-Outcome Spread',
    patternData: [
      {
        name: 'Situation',
        desc: 'The current environment or problem context.',
      },
      {
        name: 'Action',
        desc: 'The measures to be taken or the current direction of action.',
      },
      {
        name: 'Outcome',
        desc: 'The possible results or effects of taking action.',
      },
    ],
    scenario: 'Best for evaluating the consequences of taking action in a specific situation.',
  },
  {
    id: 'PPF',
    pattern: 'Past-Present-Future Spread',
    patternData: [
      {
        name: 'Past',
        desc: 'Events that occurred in the past and their impact on the current situation.',
      },
      {
        name: 'Present',
        desc: 'The core of the current situation or problem.',
      },
      {
        name: 'Future',
        desc: 'The possible direction or potential outcome of the event.',
      },
    ],
    scenario: 'Best for exploring the progression of an event.',
  },
  {
    id: 'ORA',
    pattern: 'Obstacle-Resources-Advice Spread',
    patternData: [
      {
        name: 'Obstacle',
        desc: 'The main barriers or limitations currently faced.',
      },
      {
        name: 'Resources',
        desc: 'The advantages or resources that can be utilized.',
      },
      {
        name: 'Advice',
        desc: 'The overall direction or specific action suggestions.',
      },
    ],
    scenario: 'Best for understanding the challenges of an issue and how to overcome them.',
  },
  {
    id: 'TFA',
    pattern: 'Thoughts-Feelings-Actions Spread',
    alias: 'Thoughts-Emotions-Actions Spread',
    patternData: [
      {
        name: 'Thoughts',
        desc: 'Rational aspects, thoughts or beliefs about the issue.',
      },
      {
        name: 'Emotions',
        desc: 'Emotional responses or inner feelings.',
      },
      {
        name: 'Actions',
        desc: 'External manifestations or potential actions.',
      },
    ],
    scenario: "Best for analyzing the internal causes or conflicts in someone's thoughts, emotions, and behaviors.",
  },
  {
    id: 'MOU',
    pattern: 'Me-Other-Us Spread',
    patternData: [
      {
        name: 'Me',
        desc: "The querent's role, behavior, or feelings.",
      },
      {
        name: 'Other',
        desc: 'The other person’s status, feelings, or behavior.',
      },
      {
        name: 'Us',
        desc: 'The overall energy or future potential of the relationship.',
      },
    ],
    scenario: 'Best for analyzing the dynamics between two individuals in a relationship.',
  },
  {
    id: 'TS',
    pattern: 'Trouble Shooting Spread',
    alias: 'Straight-to-the-Core Spread',
    patternData: [
      {
        name: 'Core of the Issue',
        desc: 'Analyzing the essential nature or key point of the problem.',
      },
      {
        name: 'Advantage Resources',
        desc: 'The advantages, conditions, or support available to the querent.',
      },
      {
        name: 'Current Obstacle',
        desc: 'The main difficulties or negative factors hindering the resolution of the problem.',
      },
      {
        name: 'Action Advice',
        desc: 'Specific solutions or directions for addressing the issue.',
      },
    ],
    scenario: 'Best for quickly identifying the root cause of a problem and finding a solution.',
  },
  {
    id: 'JI',
    pattern: 'Job Interview Spread',
    patternData: [
      {
        name: 'Personal Mindset',
        desc: "The querent's mindset and psychological preparation before the interview.",
      },
      {
        name: 'Preparation',
        desc: 'The matters to particularly focus on or prepare for before the interview.',
      },
      {
        name: 'Interview Dynamics',
        desc: 'The possible situations, communication, or interactions that may occur during the interview.',
      },
      {
        name: "Other's Expectations",
        desc: "The employer's requirements, expectations, or evaluation criteria for the candidate.",
      },
      {
        name: 'Potential Outcome',
        desc: 'The possible conclusion or future trend after the interview.',
      },
    ],
    scenario: 'Best for analyzing the outcome of an interview and key considerations.',
  },
  {
    id: 'RD',
    pattern: 'Relationship Dynamics Spread',
    patternData: [
      {
        name: 'Self',
        desc: "The querent's attitude, needs, or status.",
      },
      {
        name: 'Other',
        desc: "The other person's attitude, needs, or status.",
      },
      {
        name: 'Relationship Status',
        desc: 'The current interaction patterns between the two individuals.',
      },
      {
        name: 'Potential Issues',
        desc: 'Hidden conflicts or barriers in the relationship.',
      },
      {
        name: 'Future Trend',
        desc: 'The possible evolution of the relationship.',
      },
    ],
    scenario:
      'Best for analyzing the dynamics and future of a relationship. This spread requires a second person and is not suitable for single individuals seeking romantic prospects.',
  },
  {
    id: 'LC',
    pattern: 'Lover Cross Spread',
    alias: "Lover's Cross Spread",
    patternData: [
      {
        name: 'Your Attitude',
        desc: 'Expressing your true feelings and attitude in the romantic relationship.',
      },
      {
        name: "Other's Attitude",
        desc: 'Describing the other person’s feelings, attitudes, and behaviors in the relationship.',
      },
      {
        name: 'Relationship Status',
        desc: 'The specific state, interaction patterns, or main characteristics of the relationship.',
      },
      {
        name: 'Existing Issues',
        desc: 'The main conflicts or difficulties affecting the relationship’s development.',
      },
      {
        name: 'Future Development',
        desc: 'The possible direction or trend of the relationship.',
      },
    ],
    scenario:
      'Best for analyzing the trajectory of a relationship. This spread requires a second person and is not suitable for single individuals asking about finding love.',
  },
  {
    id: 'GA',
    pattern: 'Goal Achievement Spread',
    alias: 'Goal Achievement Spread',
    patternData: [
      {
        name: 'Goal',
        desc: 'The core meaning or essence of the goal.',
      },
      {
        name: 'Motivation',
        desc: 'The driving force pushing you forward.',
      },
      {
        name: 'Obstacle',
        desc: 'The difficulties or limitations you are facing.',
      },
      {
        name: 'Resources',
        desc: 'The resources or support needed to achieve the goal.',
      },
      {
        name: 'Outcome',
        desc: 'The state or result after achieving the goal.',
      },
    ],
    scenario: 'Best for analyzing the path to achieving a goal.',
  },
  {
    id: 'P',
    pattern: 'Progress Spread',
    patternData: [
      {
        name: 'Current Status',
        desc: 'The current stage or status.',
      },
      {
        name: 'Achievements',
        desc: 'The progress and achievements made so far.',
      },
      {
        name: 'Unresolved Issues',
        desc: 'The problems that have not been addressed yet.',
      },
      {
        name: 'Progress Direction',
        desc: 'The areas where effort is needed.',
      },
      {
        name: 'Result Projection',
        desc: 'The possible final result.',
      },
    ],
    scenario: 'Best for analyzing the progress of a project, relationship, or personal growth.',
  },
  {
    id: 'SG',
    pattern: 'Spiritual Growth Spread',
    alias: 'Soul Growth Spread',
    patternData: [
      {
        name: 'Soul State',
        desc: 'The current state of your soul or inner being.',
      },
      {
        name: 'Growth Challenges',
        desc: 'The lessons or tasks you need to learn.',
      },
      {
        name: 'Growth Obstacles',
        desc: 'The barriers that hinder your growth.',
      },
      {
        name: 'Empowering Forces',
        desc: 'The forces or resources that can propel your growth.',
      },
      {
        name: 'Result Projection',
        desc: 'The possible outcome after growth.',
      },
    ],
    scenario: 'Best for exploring personal soul growth paths.',
  },
  {
    id: 'IE',
    pattern: 'Inner Exploration Spread',
    patternData: [
      {
        name: 'Inner State',
        desc: 'The current inner emotions or mental state.',
      },
      {
        name: 'Beliefs',
        desc: 'Beliefs or values, the hidden factors that drive your actions.',
      },
      {
        name: 'Fears',
        desc: 'Fears or pressures that may suppress your inner strength.',
      },
      {
        name: 'Inner Potential',
        desc: 'Strengths or resources that can support your progress.',
      },
      {
        name: 'Growth Direction',
        desc: 'Breakthroughs or goals that can be achieved through inner exploration.',
      },
    ],
    scenario: 'Best for gaining deeper insight into one’s inner world, including hidden emotions, beliefs, and potential.',
  },
  {
    id: 'DM',
    pattern: 'Decision Making Spread',
    alias: 'Decision Spread',
    patternData: [
      {
        name: 'Current Situation',
        desc: 'The current situation or status.',
      },
      {
        name: 'Choice Advantages',
        desc: 'The positive factors or advantages of the choice.',
      },
      {
        name: 'Choice Disadvantages',
        desc: 'The negative factors or drawbacks of the choice.',
      },
      {
        name: 'Other Factors',
        desc: 'Potential factors not yet considered.',
      },
      {
        name: 'Action Advice',
        desc: 'Suggested actions based on the situation.',
      },
    ],
    scenario: 'Best for analyzing the feasibility or pros and cons of a specific decision.',
  },
  {
    id: 'C',
    pattern: 'Choice Spread',
    alias: 'Two-Choices Spread',
    patternData: [
      {
        name: 'Motivating Need',
        desc: 'Your core need or motivation.',
      },
      {
        name: 'Option One',
        desc: 'The development direction of choice one.',
      },
      {
        name: 'Option Two',
        desc: 'The development direction of choice two.',
      },
      {
        name: 'Result One',
        desc: 'The final outcome of option one.',
      },
      {
        name: 'Result Two',
        desc: 'The final outcome of option two.',
      },
    ],
    scenario: 'Best for weighing the outcomes of two options and making a clear decision.',
  },
  {
    id: 'CPS',
    pattern: 'Career Path Spread',
    patternData: [
      {
        name: 'Current Status',
        desc: 'The current career status or mindset.',
      },
      {
        name: 'Obstacle',
        desc: 'The main barriers or difficulties affecting progress.',
      },
      {
        name: 'Advantage',
        desc: 'The strengths or resources in career development.',
      },
      {
        name: 'Potential',
        desc: 'Hidden talents or undiscovered possibilities.',
      },
      {
        name: 'Choice',
        desc: 'The current options or paths to consider.',
      },
      {
        name: 'Outcome',
        desc: 'The possible results based on the current path.',
      },
      {
        name: 'Advice',
        desc: 'The next step or strategy to take.',
      },
    ],
    scenario: 'Best for resolving academic and career-related dilemmas.',
  },
  {
    id: 'TOL',
    pattern: 'Tree of Life Spread',
    patternData: [
      {
        name: 'Crown',
        desc: 'Spiritual goals or ultimate vision.',
      },
      {
        name: 'Wisdom',
        desc: "The querent's intuition or insights.",
      },
      {
        name: 'Understanding',
        desc: "The querent's analysis or judgment.",
      },
      {
        name: 'Compassion',
        desc: "The querent's giving and love.",
      },
      {
        name: 'Strength',
        desc: "The querent's willpower or control.",
      },
      {
        name: 'Beauty',
        desc: 'The core force of balance.',
      },
      {
        name: 'Victory',
        desc: "The querent's motivation and achievements.",
      },
      {
        name: 'Glory',
        desc: "The querent's expression or communication.",
      },
      {
        name: 'Foundation',
        desc: "The querent's foundation or sense of security.",
      },
      {
        name: 'Kingdom',
        desc: 'Manifestation or outcome in the real world.',
      },
    ],
    scenario: 'Best for exploring self, spiritual growth, and higher meanings. Suitable only for very complex questions.',
  },
  {
    id: 'CC',
    pattern: 'Celtic Cross Spread',
    patternData: [
      {
        name: 'Current Situation',
        desc: 'Description of the present issue.',
      },
      {
        name: 'Obstacle',
        desc: 'Challenges or conflicts affecting the current situation.',
      },
      {
        name: 'Subconscious',
        desc: 'The deeper causes of the issue.',
      },
      {
        name: 'Past',
        desc: 'Past events influencing the present situation.',
      },
      {
        name: 'Goal',
        desc: 'The desired or ideal outcome.',
      },
      {
        name: 'Future',
        desc: 'Upcoming changes or trends.',
      },
      {
        name: 'Self-Perception',
        desc: 'Your view or feelings about the issue.',
      },
      {
        name: 'External Environment',
        desc: 'The impact of others on the issue.',
      },
      {
        name: 'Hopes and Fears',
        desc: 'Inner hopes or concerns.',
      },
      {
        name: 'Outcome',
        desc: 'The potential final development of the situation.',
      },
    ],
    scenario:
      'Best for comprehensive analysis of a question, including its background, challenges, potential developments, and possible outcomes. Suitable only for very complex questions.',
  },
  {
    id: 'Z',
    pattern: 'Zodiac Spread',
    alias: 'Twelve Houses Spread',
    patternData: [
      {
        name: 'First House (Self)',
        desc: 'Your personality, appearance, or attitude.',
      },
      {
        name: 'Second House (Wealth)',
        desc: 'Financial situation or material resources.',
      },
      {
        name: 'Third House (Communication)',
        desc: 'Communication, learning, or short trips.',
      },
      {
        name: 'Fourth House (Home)',
        desc: 'Family, home life, or inner emotions.',
      },
      {
        name: 'Fifth House (Creativity)',
        desc: 'Hobbies, creativity, or romance.',
      },
      {
        name: 'Sixth House (Work)',
        desc: 'Work, health, or daily routines.',
      },
      {
        name: 'Seventh House (Relationships)',
        desc: 'Partner relationships or cooperation.',
      },
      {
        name: 'Eighth House (Transformation)',
        desc: 'Transformation, shared resources, or deep connections.',
      },
      {
        name: 'Ninth House (Exploration)',
        desc: 'Learning, travel, or spiritual pursuits.',
      },
      {
        name: 'Tenth House (Career)',
        desc: 'Career, social status, or ambitions.',
      },
      {
        name: 'Eleventh House (Social)',
        desc: 'Friendships, social groups, or future planning.',
      },
      {
        name: 'Twelfth House (Subconscious)',
        desc: 'Secrets, the subconscious, or spiritual growth.',
      },
    ],
    scenario: 'Best for a holistic reading of personal life, covering areas like career, relationships, and health. Suitable only for very complex questions.',
  },
] as const satisfies PatternListItem[]

export const patternListTW = [
  {
    id: 'S',
    pattern: '0',
    patternData: [],
    scenario: '適合快速決策',
  },
  {
    id: 'ABS',
    pattern: '選 A 的發展-選 B 的發展 - 建議牌陣',
    patternData: [
      {
        name: '選 A 的發展',
        desc: '選 A 會帶來的影響',
      },
      {
        name: '選 B 的發展',
        desc: '選 B 會帶來的影響',
      },
      {
        name: '建議',
        desc: '整體方向或具體的行動建議',
      },
    ],
    scenario: '適合面臨兩個選擇時，幫助用戶分析兩個選擇可能的發展趨勢',
  },
  {
    id: 'ABCS',
    pattern: '選 A 的發展-選 B 的發展 - 選 C 的發展 - 建議牌陣',
    patternData: [
      {
        name: '選 A 的發展',
        desc: '選 A 會帶來的影響',
      },
      {
        name: '選 B 的發展',
        desc: '選 B 會帶來的影響',
      },
      {
        name: '選 C 的發展',
        desc: '選 C 會帶來的影響',
      },
      {
        name: '建議',
        desc: '整體方向或具體的行動建議',
      },
    ],
    scenario: '適合當用戶需要在三個選項間做決策時，分析每個選項可能的發展趨勢',
  },
  {
    id: 'TOG',
    pattern: '今日氣場 - 穿搭風格 - 玄學指引牌陣',
    patternData: [
      {
        name: '今日氣場',
        desc: '代表今天的整體氛圍、能量',
      },
      {
        name: '穿衣風格',
        desc: '適合今天的服裝風格',
      },
      {
        name: '玄學指引',
        desc: '推薦的顏色或關鍵單品',
      },
    ],
    scenario: '適合用戶每日出門前，提供當天運勢相關的穿搭風格建議',
  },
  {
    id: 'BNS',
    pattern: '購入影響-放棄影響-建議牌陣',
    patternData: [
      {
        name: '購入影響',
        desc: '購買後可能帶來的結果或影響',
      },
      {
        name: '放棄影響',
        desc: '不購買可能帶來的結果或影響',
      },
      {
        name: '建議',
        desc: '具體的購買決策建議',
      },
    ],
    scenario: '適合用戶在購物糾結時，分析購買或放棄物品所帶來的潛在影響',
  },
  {
    id: 'SAO',
    pattern: '情景-行動-結果牌陣',
    patternData: [
      {
        name: '情景',
        desc: '當前的環境或問題背景',
      },
      {
        name: '行動',
        desc: '需要採取的措施或當前的行動方向',
      },
      {
        name: '結果',
        desc: '如果採取行動，可能會得到的結果或影響',
      },
    ],
    scenario: '適合評估特定情境下採取行動的後果',
  },
  {
    id: 'PPF',
    pattern: '過去-現在-未來牌陣',
    patternData: [
      {
        name: '過去',
        desc: '過去發生的事情，以及它對當前狀況的影響',
      },
      {
        name: '現在',
        desc: '當前的情境或問題的核心',
      },
      {
        name: '未來',
        desc: '事件可能的走向或潛在的結果',
      },
    ],
    scenario: '適合探索事件的發展趨勢',
  },
  {
    id: 'ORA',
    pattern: '阻礙-資源-建議牌陣',
    patternData: [
      {
        name: '阻礙',
        desc: '目前面臨的主要障礙或限制',
      },
      {
        name: '幫助',
        desc: '可以利用的優勢或資源',
      },
      {
        name: '建議',
        desc: '整體方向或具體的行動建議',
      },
    ],
    scenario: '適合想知道知道某件事的阻礙是什麼，以及如何克服',
  },
  {
    id: 'TFA',
    pattern: '思想-情感-行為牌陣',
    patternData: [
      {
        name: '思想',
        desc: '理性層面，關於問題的想法或信念',
      },
      {
        name: '情感',
        desc: '情緒反應或內心的感受',
      },
      {
        name: '行為',
        desc: '外在表現或可能採取的行動',
      },
    ],
    scenario: '適合分析某一個人在思想、情感和行動層面的內在原因或矛盾',
  },
  {
    id: 'MOU',
    pattern: '我-對方-我們牌陣',
    patternData: [
      {
        name: '我',
        desc: '問卜者的角色、行為或感受',
      },
      {
        name: '對方',
        desc: '對方的狀態、感受或行為',
      },
      {
        name: '我們',
        desc: '關係整體的能量或未來可能性',
      },
    ],
    scenario: '適合分析兩人之間的關係動態',
  },
  {
    id: 'TS',
    pattern: '直指核心牌陣',
    patternData: [
      {
        name: '問題核心',
        desc: '解析問題的核心本質或關鍵點',
      },
      {
        name: '優勢資源',
        desc: '問卜者目前可用的優勢、條件或支持',
      },
      {
        name: '當前障礙',
        desc: '阻擋問題解決的主要困難或負面因素',
      },
      {
        name: '行動建議',
        desc: '針對問題提出的具體解決方案或方向',
      },
    ],
    scenario: '適合需要快速明確問題根源並找到解決方案的問題',
  },
  {
    id: 'JI',
    pattern: '面試求職牌陣',
    patternData: [
      {
        name: '個人心態',
        desc: '自己在面試前的心態和心理準備',
      },
      {
        name: '面前準備',
        desc: '面試前需要特別關注或準備的事項',
      },
      {
        name: '面試動態',
        desc: '面試中可能發生的情境、交流或互動',
      },
      {
        name: '對方期望',
        desc: '對方對求職者的要求、期望或評判標準',
      },
      {
        name: '潛在結果',
        desc: '面試後的可能結局或潛在發展趨勢',
      },
    ],
    scenario: '適合分析面試的走向和注意事項',
  },
  {
    id: 'RD',
    pattern: '關係牌陣',
    patternData: [
      {
        name: '自我',
        desc: '問卜者的態度、需求或狀態',
      },
      {
        name: '對方',
        desc: '對方的態度、需求或狀態',
      },
      {
        name: '關係現狀',
        desc: '兩人當前的互動模式',
      },
      {
        name: '潛在問題',
        desc: '關係中隱藏的矛盾或障礙',
      },
      {
        name: '未來走向',
        desc: '關係可能的演變',
      },
    ],
    scenario: '適合分析關係動態和發展方向',
  },
  {
    id: 'LC',
    pattern: '戀人十字牌陣',
    patternData: [
      {
        name: '你的態度',
        desc: '表達你在愛情關係中的真實感受和態度',
      },
      {
        name: '對方態度',
        desc: '描述對方在關係中的感受、態度和行為',
      },
      {
        name: '關係現狀',
        desc: '關係的具體情況，互動模式或主要特點',
      },
      {
        name: '存在問題',
        desc: '影響關係發展的主要矛盾或困難',
      },
      {
        name: '未來發展',
        desc: '關係可能的方向或發展趨勢',
      },
    ],
    scenario: '適合分析兩人關係的走向',
  },
  {
    id: 'GA',
    pattern: '目標達成牌陣',
    patternData: [
      {
        name: '目標',
        desc: '目標的核心意義或本質所在',
      },
      {
        name: '動力',
        desc: '驅動你前進的動力',
      },
      {
        name: '障礙',
        desc: '當前面臨的困難或限制',
      },
      {
        name: '資源',
        desc: '達成目標所需的資源或支持',
      },
      {
        name: '結果',
        desc: '實現目標後的狀態或成果',
      },
    ],
    scenario: '適合分析目標的實現路徑',
  },
  {
    id: 'P',
    pattern: '進展牌陣',
    patternData: [
      {
        name: '當前狀態',
        desc: '目前所處的階段或狀態',
      },
      {
        name: '已達成',
        desc: '已取得的進展和成果',
      },
      {
        name: '未達成',
        desc: '尚未解決的問題',
      },
      {
        name: '進展方向',
        desc: '需要努力的方向',
      },
      {
        name: '結果推演',
        desc: '可能的最終結果',
      },
    ],
    scenario: '適合分析某一項目、關係或成長的進展',
  },
  {
    id: 'SG',
    pattern: '靈魂成長牌陣',
    patternData: [
      {
        name: '靈魂狀態',
        desc: '當前的靈魂或內心狀態',
      },
      {
        name: '成長課題',
        desc: '需要學習的課題或任務',
      },
      {
        name: '成長阻礙',
        desc: '影響成長的障礙',
      },
      {
        name: '助力力量',
        desc: '可以推動成長的力量或資源',
      },
      {
        name: '結果推演',
        desc: '成長後的可能結果',
      },
    ],
    scenario: '適合探索個人靈魂成長的路徑',
  },
  {
    id: 'IE',
    pattern: '內在探索牌陣',
    patternData: [
      {
        name: '內心狀態',
        desc: '當前的內在情緒或心理狀況',
      },
      {
        name: '信念',
        desc: '信念或價值觀，驅動行為的隱性因素',
      },
      {
        name: '恐懼',
        desc: '恐懼或壓力，可能抑制你的內在力量',
      },
      {
        name: '內在潛能',
        desc: '可以支持你前進的優點或資源',
      },
      {
        name: '成長方向',
        desc: '通過內在探索可以實現的突破或目標',
      },
    ],
    scenario: '適合深入了解自己的內心世界，探索隱藏的情緒、信念和潛力',
  },
  {
    id: 'DM',
    pattern: '決定牌陣',
    patternData: [
      {
        name: '當前狀況',
        desc: '當前的情境或狀態',
      },
      {
        name: '選擇優勢',
        desc: '選擇的正面因素或優勢',
      },
      {
        name: '選擇劣勢',
        desc: '選擇的負面因素或缺點',
      },
      {
        name: '其他因素',
        desc: '未考慮的潛在因素',
      },
      {
        name: '行動建議',
        desc: '根據情況給出的行動建議',
      },
    ],
    scenario: '幫助分析一個具體決定的可行性或利弊',
  },
  {
    id: 'C',
    pattern: '二擇一牌陣',
    patternData: [
      {
        name: '需求動機',
        desc: '你的核心需求或動機',
      },
      {
        name: '發展一',
        desc: '選擇一的發展方向',
      },
      {
        name: '發展二',
        desc: '選擇二的發展方向',
      },
      {
        name: '結果一',
        desc: '選擇一的最終結果',
      },
      {
        name: '結果二',
        desc: '選擇二的最終結果',
      },
    ],
    scenario: '適合權衡兩種選擇的發展與結果，幫助做出明確決策',
  },
  {
    id: 'CPS',
    pattern: '事業路徑牌陣',
    patternData: [
      {
        name: '當前狀態',
        desc: '目前的職業狀態或心態',
      },
      {
        name: '阻礙',
        desc: '影響前進的主要障礙或困難',
      },
      {
        name: '優勢',
        desc: '在職業發展中的優勢或資源',
      },
      {
        name: '潛力',
        desc: '隱藏才能或未被發現的可能性',
      },
      {
        name: '選擇',
        desc: '目前可以考慮的選擇或路徑',
      },
      {
        name: '結果',
        desc: '根據當前路徑的可能結果',
      },
      {
        name: '建議',
        desc: '下一步應該採取的行動或策略',
      },
    ],
    scenario: '適合解決學業和職業發展過程中的困惑',
  },
  {
    id: 'TOL',
    pattern: '生命之樹牌陣',
    patternData: [
      {
        name: '冠',
        desc: '靈性目標或最終願景',
      },
      {
        name: '智慧',
        desc: '問卜者的直覺或洞見',
      },
      {
        name: '理解',
        desc: '問卜者的分析或判斷',
      },
      {
        name: '慈悲',
        desc: '問卜者的給予與愛',
      },
      {
        name: '力量',
        desc: '問卜者的意志或掌控力',
      },
      {
        name: '美',
        desc: '平衡的核心力量',
      },
      {
        name: '勝利',
        desc: '問卜者的動力與成就',
      },
      {
        name: '榮耀',
        desc: '問卜者的表達或交流',
      },
      {
        name: '基礎',
        desc: '問卜者的根基或安全感',
      },
      {
        name: '王國',
        desc: '現實世界中的表現或結果',
      },
    ],
    scenario: '適合探索自我、精神成長及更高層次的意義，只有非常複雜的問題才適合',
  },
  {
    id: 'CC',
    pattern: '凱爾特十字牌陣',
    patternData: [
      {
        name: '現狀',
        desc: '當前問題的描述',
      },
      {
        name: '阻礙',
        desc: '影響現狀的挑戰或矛盾',
      },
      {
        name: '潛意識',
        desc: '問題的深層原因',
      },
      {
        name: '過去',
        desc: '影響現狀的過去事件',
      },
      {
        name: '目標',
        desc: '期望或理想結果',
      },
      {
        name: '未來',
        desc: '即將發生的變化或趨勢',
      },
      {
        name: '自我狀態',
        desc: '你對問題的看法或感受',
      },
      {
        name: '外界環境',
        desc: '他人對問題的影響',
      },
      {
        name: '希望與恐懼',
        desc: '內心的期盼或擔憂',
      },
      {
        name: '結果',
        desc: '事情可能的最終發展',
      },
    ],
    scenario: '適合全面分析複雜問題的成因與發展，只有非常複雜的問題才適合',
  },
  {
    id: 'Z',
    pattern: '十二宮牌陣',
    patternData: [
      {
        name: '第一宮（自我）',
        desc: '你的性格、外表或態度',
      },
      {
        name: '第二宮（財富）',
        desc: '財務狀況或物質資源',
      },
      {
        name: '第三宮（交流）',
        desc: '溝通、學習或短途旅行',
      },
      {
        name: '第四宮（家庭）',
        desc: '家人、家居或內在情感',
      },
      {
        name: '第五宮（創造力）',
        desc: '嗜好、創意或浪漫',
      },
      {
        name: '第六宮（工作）',
        desc: '工作、健康或日常事務',
      },
      {
        name: '第七宮（關係）',
        desc: '伴侶關係或合作',
      },
      {
        name: '第八宮（轉化）',
        desc: '轉變、分享資源或深層連結',
      },
      {
        name: '第九宮（探索）',
        desc: '學習、旅行或精神追求',
      },
      {
        name: '第十宮（事業）',
        desc: '職業、社會地位或野心',
      },
      {
        name: '第十一宮（社交）',
        desc: '友誼、社團或未來規劃',
      },
      {
        name: '第十二宮（潛意識）',
        desc: '隱密、潛意識或靈性成長',
      },
    ],
    scenario: '涵蓋事業、情感、健康等全面的個人生活解讀，只有非常複雜的問題才適合',
  },
] as const satisfies PatternListItem[]

export const patternListKR = [
  {
    id: 'S',
    pattern: '0',
    patternData: [],
    scenario: '빠른 의사결정에 적합',
  },
  {
    id: 'ABS',
    pattern: '선택 A의 발전 - 선택 B의 발전 - 조언 스프레드',
    patternData: [
      { name: '선택 A의 발전', desc: '선택 A가 가져올 영향' },
      { name: '선택 B의 발전', desc: '선택 B가 가져올 영향' },
      { name: '조언', desc: '전체 방향 또는 구체적인 행동 조언' },
    ],
    scenario: '두 가지 선택지에서 각 선택의 잠재적 발전 추세를 분석하는 데 적합',
  },
  {
    id: 'ABCS',
    pattern: '선택 A의 발전 - 선택 B의 발전 - 선택 C의 발전 - 조언 스프레드',
    patternData: [
      { name: '선택 A의 발전', desc: '선택 A가 가져올 영향' },
      { name: '선택 B의 발전', desc: '선택 B가 가져올 영향' },
      { name: '선택 C의 발전', desc: '선택 C가 가져올 영향' },
      { name: '조언', desc: '전체 방향 또는 구체적인 행동 조언' },
    ],
    scenario: '세 가지 옵션에서 각 선택의 발전 추세를 분석하는 데 적합',
  },
  {
    id: 'TOG',
    pattern: '오늘의 기운 - 패션 스타일 - 스피리추얼 가이드 스프레드',
    patternData: [
      { name: '오늘의 기운', desc: '오늘의 전반적인 분위기와 에너지' },
      { name: '패션 스타일', desc: '오늘에 어울리는 의상 스타일' },
      { name: '스피리추얼 가이드', desc: '추천 색상 또는 핵심 아이템' },
    ],
    scenario: '매일 외출 전, 오늘의 운세에 맞춘 패션 스타일을 제안할 때 적합',
  },
  {
    id: 'BNS',
    pattern: '구입 영향 - 포기 영향 - 조언 스프레드',
    patternData: [
      { name: '구입 영향', desc: '구매 후 예상되는 결과 또는 영향' },
      { name: '포기 영향', desc: '구매하지 않을 경우 예상되는 결과 또는 영향' },
      { name: '조언', desc: '구체적인 구매 결정 조언' },
    ],
    scenario: '쇼핑으로 고민할 때, 구매 및 포기의 잠재적 영향을 분석하는 데 적합',
  },
  {
    id: 'SAO',
    pattern: '상황 - 행동 - 결과 스프레드',
    patternData: [
      { name: '상황', desc: '현재 환경 또는 문제 배경' },
      { name: '행동', desc: '취해야 할 조치 또는 행동 방향' },
      { name: '결과', desc: '행동을 취할 경우 예상되는 결과 또는 영향' },
    ],
    scenario: '특정 상황에서 행동의 결과를 평가할 때 적합',
  },
  {
    id: 'PPF',
    pattern: '과거 - 현재 - 미래 스프레드',
    patternData: [
      { name: '과거', desc: '과거 사건과 현재에 미친 영향' },
      { name: '현재', desc: '현재 상황 또는 문제의 핵심' },
      { name: '미래', desc: '사건의 잠재적 전개 또는 결과' },
    ],
    scenario: '사건의 발전 추세를 탐구하는 데 적합',
  },
  {
    id: 'ORA',
    pattern: '장애 - 자원 - 조언 스프레드',
    patternData: [
      { name: '장애', desc: '현재 직면한 주요 장애 또는 제한' },
      { name: '자원', desc: '활용할 수 있는 이점 또는 자원' },
      { name: '조언', desc: '전체 방향 또는 구체적인 행동 조언' },
    ],
    scenario: '문제의 장애와 극복 방법을 알고 싶을 때 적합',
  },
  {
    id: 'TFA',
    pattern: '사고 - 감정 - 행동 스프레드',
    patternData: [
      { name: '사고', desc: '문제에 대한 생각 또는 신념' },
      { name: '감정', desc: '감정 반응 또는 내면 감정' },
      { name: '행동', desc: '외적 표현 또는 가능한 행동' },
    ],
    scenario: '개인의 사고·감정·행동 측면의 내적 원인 또는 갈등을 분석할 때 적합',
  },
  {
    id: 'MOU',
    pattern: '나 - 상대 - 우리 스프레드',
    patternData: [
      { name: '나', desc: '질문자의 역할·행동 또는 감정' },
      { name: '상대', desc: '상대방의 상태·감정 또는 행동' },
      { name: '우리', desc: '관계 전체의 에너지 또는 미래 가능성' },
    ],
    scenario: '두 사람 관계의 동태를 분석하는 데 적합',
  },
  {
    id: 'TS',
    pattern: '핵심 직시 스프레드',
    patternData: [
      { name: '문제 핵심', desc: '문제의 본질 또는 핵심 포인트' },
      { name: '강점 자원', desc: '현재 사용할 수 있는 강점·조건·지원' },
      { name: '현재 장애', desc: '문제 해결을 방해하는 주요 어려움' },
      { name: '행동 조언', desc: '문제 해결을 위한 구체적 방안·방향' },
    ],
    scenario: '문제의 근원을 빠르게 파악하고 해결책을 찾을 때 적합',
  },
  {
    id: 'JI',
    pattern: '면접·취업 스프레드',
    patternData: [
      { name: '개인 심리', desc: '면접 전 마음가짐·심리 준비' },
      { name: '면접 준비', desc: '면접 전 특별히 준비·주의할 사항' },
      { name: '면접 동태', desc: '면접 중 발생할 상황·소통·상호작용' },
      { name: '상대의 기대', desc: '채용 측이 기대하는 요구·평가기준' },
      { name: '잠재 결과', desc: '면접 후 예상 결과 또는 발전 추세' },
    ],
    scenario: '면접의 향방과 주의 사항을 분석하는 데 적합',
  },
  {
    id: 'RD',
    pattern: '관계 스프레드',
    patternData: [
      { name: '자신', desc: '질문자의 태도·요구·상태' },
      { name: '상대', desc: '상대의 태도·요구·상태' },
      { name: '관계 현황', desc: '현재 상호작용 패턴' },
      { name: '잠재 문제', desc: '숨겨진 갈등 또는 장애' },
      { name: '미래 방향', desc: '관계의 잠재적 전개' },
    ],
    scenario: '관계 동태와 발전 방향을 분석하는 데 적합',
  },
  {
    id: 'LC',
    pattern: '연인 십자 스프레드',
    patternData: [
      { name: '당신의 태도', desc: '관계에서 당신의 진솔한 감정·태도' },
      { name: '상대의 태도', desc: '상대가 관계에서 느끼는 감정·태도·행동' },
      { name: '관계 현황', desc: '관계의 구체적 상황·특징' },
      { name: '존재 문제', desc: '관계 발전을 막는 주요 갈등' },
      { name: '미래 발전', desc: '관계의 향후 전개 또는 추세' },
    ],
    scenario: '두 사람 관계의 향방을 분석하는 데 적합',
  },
  {
    id: 'GA',
    pattern: '목표 달성 스프레드',
    patternData: [
      { name: '목표', desc: '목표의 핵심 의미 또는 본질' },
      { name: '동력', desc: '당신을 추진하는 동기' },
      { name: '장애', desc: '현재 직면한 어려움 또는 제한' },
      { name: '자원', desc: '목표 달성에 필요한 자원·지원' },
      { name: '결과', desc: '목표 달성 이후의 상태·성과' },
    ],
    scenario: '목표 달성 경로를 분석하는 데 적합',
  },
  {
    id: 'P',
    pattern: '진행 스프레드',
    patternData: [
      { name: '현재 상태', desc: '현재 단계 또는 상태' },
      { name: '달성', desc: '이미 이룬 진전 및 성과' },
      { name: '미달성', desc: '아직 해결되지 않은 문제' },
      { name: '진행 방향', desc: '노력해야 할 방향' },
      { name: '결과 예측', desc: '가능한 최종 결과' },
    ],
    scenario: '프로젝트·관계·성장의 진행 상황을 분석하는 데 적합',
  },
  {
    id: 'SG',
    pattern: '영혼 성장 스프레드',
    patternData: [
      { name: '영혼 상태', desc: '현재 영혼 또는 내면 상태' },
      { name: '성장 과제', desc: '배워야 할 과제·임무' },
      { name: '성장 장애', desc: '성장을 막는 장애' },
      { name: '지원 힘', desc: '성장을 돕는 힘·자원' },
      { name: '결과 예측', desc: '성장 후 가능한 결과' },
    ],
    scenario: '개인 영혼 성장의 경로를 탐구하는 데 적합',
  },
  {
    id: 'IE',
    pattern: '내면 탐색 스프레드',
    patternData: [
      { name: '내면 상태', desc: '현재 내면 감정·심리 상태' },
      { name: '신념', desc: '행동을 주도하는 가치관·신념' },
      { name: '두려움', desc: '두려움·압박, 내면 힘을 억제' },
      { name: '내면 잠재력', desc: '전진을 돕는 장점·자원' },
      { name: '성장 방향', desc: '내면 탐색을 통해 달성할 목표·돌파구' },
    ],
    scenario: '자신의 내면 세계와 숨겨진 감정·신념·잠재력을 탐구하는 데 적합',
  },
  {
    id: 'DM',
    pattern: '결정 스프레드',
    patternData: [
      { name: '현재 상황', desc: '현재 상황 또는 상태' },
      { name: '선택 장점', desc: '선택의 긍정적 요소·장점' },
      { name: '선택 단점', desc: '선택의 부정적 요소·단점' },
      { name: '기타 요소', desc: '미처 고려하지 못한 잠재 요소' },
      { name: '행동 조언', desc: '상황에 대한 행동 조언' },
    ],
    scenario: '특정 결정의 실행 가능성·장단점을 분석하는 데 도움',
  },
  {
    id: 'C',
    pattern: '이중 선택 스프레드',
    patternData: [
      { name: '욕구 동기', desc: '핵심 욕구·동기' },
      { name: '발전 1', desc: '선택 1의 발전 방향' },
      { name: '발전 2', desc: '선택 2의 발전 방향' },
      { name: '결과 1', desc: '선택 1의 최종 결과' },
      { name: '결과 2', desc: '선택 2의 최종 결과' },
    ],
    scenario: '두 선택의 발전·결과를 저울질하여 명확한 결정을 내릴 때 적합',
  },
  {
    id: 'CPS',
    pattern: '커리어 경로 스프레드',
    patternData: [
      { name: '현재 상태', desc: '현재 직업 상태 또는 마음가짐' },
      { name: '장애', desc: '전진을 막는 주요 장애·어려움' },
      { name: '강점', desc: '직업 발전에서의 강점·자원' },
      { name: '잠재력', desc: '숨겨진 재능·가능성' },
      { name: '선택', desc: '고려할 수 있는 경로·선택' },
      { name: '결과', desc: '현재 경로의 가능한 결과' },
      { name: '조언', desc: '다음 단계 전략·행동' },
    ],
    scenario: '학업·직업 발전 고민을 해결하는 데 적합',
  },
  {
    id: 'TOL',
    pattern: '생명의 나무 스프레드',
    patternData: [
      { name: '왕관', desc: '영적 목표·궁극적 비전' },
      { name: '지혜', desc: '질문자의 직관·통찰' },
      { name: '이해', desc: '질문자의 분석·판단' },
      { name: '자비', desc: '질문자의 베풂·사랑' },
      { name: '힘', desc: '질문자의 의지·통제력' },
      { name: '아름다움', desc: '균형의 핵심 힘' },
      { name: '승리', desc: '질문자의 동기·성취' },
      { name: '영광', desc: '질문자의 표현·소통' },
      { name: '기초', desc: '질문자의 기반·안정감' },
      { name: '왕국', desc: '현실 세계에서의 표현·결과' },
    ],
    scenario: '자아·정신 성장과 고차원 의미를 탐구할 때 적합(매우 복잡한 문제에만 권장)',
  },
  {
    id: 'CC',
    pattern: '켈틱 크로스 스프레드',
    patternData: [
      { name: '현황', desc: '현재 문제의 설명' },
      { name: '장애', desc: '현황에 영향을 미치는 도전·갈등' },
      { name: '잠재의식', desc: '문제의 심층 원인' },
      { name: '과거', desc: '현황에 영향을 준 과거 사건' },
      { name: '목표', desc: '기대·이상적 결과' },
      { name: '미래', desc: '곧 발생할 변화·추세' },
      { name: '자기 상태', desc: '문제에 대한 당신의 견해·감정' },
      { name: '외부 환경', desc: '타인이 미치는 영향' },
      { name: '희망과 두려움', desc: '내면의 기대·우려' },
      { name: '결과', desc: '사건이 궁극적으로 전개될 가능성' },
    ],
    scenario: '복잡한 문제의 원인·발전을 전면적으로 분석할 때 적합(매우 복잡한 문제에만 권장)',
  },
  {
    id: 'Z',
    pattern: '12궁 스프레드',
    patternData: [
      { name: '제1궁(자아)', desc: '성격·외모·태도' },
      { name: '제2궁(재물)', desc: '재정 상태·물질 자원' },
      { name: '제3궁(교류)', desc: '소통·학습·단거리 여행' },
      { name: '제4궁(가정)', desc: '가족·가정·내면 감정' },
      { name: '제5궁(창의력)', desc: '취미·창의성·로맨스' },
      { name: '제6궁(일)', desc: '일·건강·일상' },
      { name: '제7궁(관계)', desc: '파트너 관계·협력' },
      { name: '제8궁(변혁)', desc: '변화·공유 자원·깊은 연결' },
      { name: '제9궁(탐험)', desc: '학습·여행·정신적 추구' },
      { name: '제10궁(커리어)', desc: '직업·사회 지위·야망' },
      { name: '제11궁(사회)', desc: '우정·커뮤니티·미래 계획' },
      { name: '제12궁(잠재의식)', desc: '숨겨진 것·잠재의식·영적 성장' },
    ],
    scenario: '커리어·감정·건강 등 삶 전반을 해석할 때 적합(매우 복잡한 문제에만 권장)',
  },
] as const satisfies PatternListItem[]

export const patternListJP = [
  {
    id: 'S',
    pattern: '0',
    patternData: [],
    scenario: '迅速な意思決定に適しています',
  },
  {
    id: 'ABS',
    pattern: '選択Aの展開 - 選択Bの展開 - アドバイススプレッド',
    patternData: [
      { name: '選択Aの展開', desc: '選択Aがもたらす影響' },
      { name: '選択Bの展開', desc: '選択Bがもたらす影響' },
      { name: 'アドバイス', desc: '全体的な方向性または具体的な行動提案' },
    ],
    scenario: '2つの選択肢で迷っているときに、それぞれの展開を分析するのに適しています',
  },
  {
    id: 'ABCS',
    pattern: '選択Aの展開 - 選択Bの展開 - 選択Cの展開 - アドバイススプレッド',
    patternData: [
      { name: '選択Aの展開', desc: '選択Aがもたらす影響' },
      { name: '選択Bの展開', desc: '選択Bがもたらす影響' },
      { name: '選択Cの展開', desc: '選択Cがもたらす影響' },
      { name: 'アドバイス', desc: '全体的な方向性または具体的な行動提案' },
    ],
    scenario: '3つの選択肢の可能な展開を分析するのに適しています',
  },
  {
    id: 'TOG',
    pattern: '本日のオーラ - コーディネートスタイル - スピリチュアルガイダンススプレッド',
    patternData: [
      { name: '本日のオーラ', desc: '今日全体の雰囲気やエネルギーを表します' },
      { name: 'コーディネートスタイル', desc: '今日に適した服装スタイル' },
      { name: 'スピリチュアルガイダンス', desc: '推奨されるカラーやキープロダクト' },
    ],
    scenario: '毎日の外出前に、その日の運勢に合わせたコーディネートを提案するのに適しています',
  },
  {
    id: 'BNS',
    pattern: '購入の影響 - 見送る影響 - アドバイススプレッド',
    patternData: [
      { name: '購入の影響', desc: '購入後にもたらす結果や影響' },
      { name: '見送る影響', desc: '購入を見送った場合の結果や影響' },
      { name: 'アドバイス', desc: '具体的な購入判断のアドバイス' },
    ],
    scenario: '買うかどうか迷ったときに、購入と見送りそれぞれの影響を分析するのに適しています',
  },
  {
    id: 'SAO',
    pattern: '状況 - 行動 - 結果スプレッド',
    patternData: [
      { name: '状況', desc: '現在の環境または問題の背景' },
      { name: '行動', desc: '取るべき措置または現在の行動方針' },
      { name: '結果', desc: '行動を取った場合に得られる可能性のある結果や影響' },
    ],
    scenario: '特定の状況で行動を取った場合の結果を評価するのに適しています',
  },
  {
    id: 'PPF',
    pattern: '過去 - 現在 - 未来スプレッド',
    patternData: [
      { name: '過去', desc: '過去に起きた出来事と現状への影響' },
      { name: '現在', desc: '現在の状況または問題の核心' },
      { name: '未来', desc: '出来事の将来の展開または潜在的結果' },
    ],
    scenario: '出来事の展開を探るのに適しています',
  },
  {
    id: 'ORA',
    pattern: '障害 - 資源 - アドバイススプレッド',
    patternData: [
      { name: '障害', desc: '現在直面している主な障害・制限' },
      { name: '支援', desc: '活用できる利点やリソース' },
      { name: 'アドバイス', desc: '全体的な方向性または具体的な行動提案' },
    ],
    scenario: 'ある事柄の障害とその克服方法を知りたいときに適しています',
  },
  {
    id: 'TFA',
    pattern: '思考 - 感情 - 行動スプレッド',
    patternData: [
      { name: '思考', desc: '理性的側面、問題に対する考えや信念' },
      { name: '感情', desc: '感情的反応または内面的感覚' },
      { name: '行動', desc: '外面的表れまたは取り得る行動' },
    ],
    scenario: 'ある人の思考・感情・行動レベルの内的要因や葛藤を分析するのに適しています',
  },
  {
    id: 'MOU',
    pattern: '私 - 相手 - 私たちスプレッド',
    patternData: [
      { name: '私', desc: '占いを求める人の役割、行動または感情' },
      { name: '相手', desc: '相手の状態、感情または行動' },
      { name: '私たち', desc: '関係全体のエネルギーまたは将来の可能性' },
    ],
    scenario: '二人の関係のダイナミクスを分析するのに適しています',
  },
  {
    id: 'TS',
    pattern: '核心直視スプレッド',
    patternData: [
      { name: '問題の核心', desc: '問題の本質またはキーを解析する' },
      { name: '優位なリソース', desc: '現在利用できる利点、条件または支援' },
      { name: '現在の障害', desc: '問題解決を阻む主な困難またはネガティブ要因' },
      { name: '行動アドバイス', desc: '問題に対して提案される具体的な解決策または方向性' },
    ],
    scenario: '問題の根本原因を迅速に特定し、解決策を見つけたいときに適しています',
  },
  {
    id: 'JI',
    pattern: '面接・就職スプレッド',
    patternData: [
      { name: '自身のメンタル', desc: '面接前の心構えや心理的準備' },
      { name: '面接準備', desc: '面接前に特に注意すべき事項' },
      { name: '面接動向', desc: '面接中に起こり得る状況ややり取り' },
      { name: '相手の期待', desc: '採用側が求職者に求める要件や評価基準' },
      { name: '潜在的結果', desc: '面接後に起こり得る結末または展開' },
    ],
    scenario: '面接の流れや注意点を分析するのに適しています',
  },
  {
    id: 'RD',
    pattern: '関係スプレッド',
    patternData: [
      { name: '自己', desc: '占いを求める人の態度、ニーズまたは状態' },
      { name: '相手', desc: '相手の態度、ニーズまたは状態' },
      { name: '関係現状', desc: '二人の現在の相互作用パターン' },
      { name: '潜在的問題', desc: '関係に潜む矛盾または障害' },
      { name: '将来の展開', desc: '関係の可能な進展' },
    ],
    scenario: '関係のダイナミクスと進展方向を分析するのに適しています',
  },
  {
    id: 'LC',
    pattern: '恋人クロススプレッド',
    patternData: [
      { name: 'あなたの態度', desc: '恋愛関係でのあなたの本当の感情や態度を表す' },
      { name: '相手の態度', desc: '関係における相手の感情、態度、行動を描写' },
      { name: '関係現状', desc: '関係の具体的状況、相互作用パターンまたは主な特徴' },
      { name: '存在する問題', desc: '関係の発展を妨げる主要な矛盾または困難' },
      { name: '将来の展開', desc: '関係が進む可能性のある方向性または展開' },
    ],
    scenario: '二人の関係の将来を分析するのに適しています',
  },
  {
    id: 'GA',
    pattern: '目標達成スプレッド',
    patternData: [
      { name: '目標', desc: '目標の核心的意義または本質' },
      { name: '動機', desc: '前進を駆り立てる動力' },
      { name: '障害', desc: '現在直面している困難または制限' },
      { name: '資源', desc: '目標達成に必要なリソースまたは支援' },
      { name: '結果', desc: '目標達成後の状態または成果' },
    ],
    scenario: '目標を達成するための道筋を分析するのに適しています',
  },
  {
    id: 'P',
    pattern: '進捗スプレッド',
    patternData: [
      { name: '現在の状態', desc: '現在の段階または状態' },
      { name: '達成済み', desc: 'すでに得られた進展と成果' },
      { name: '未達成', desc: 'まだ解決されていない問題' },
      { name: '進展方向', desc: '努力すべき方向性' },
      { name: '結果の推定', desc: '最終的な結果の可能性' },
    ],
    scenario: 'プロジェクト、関係または成長の進捗を分析するのに適しています',
  },
  {
    id: 'SG',
    pattern: '心の成長スプレッド',
    patternData: [
      { name: '心の状態', desc: '現在の心または内面の状態' },
      { name: '成長課題', desc: '学ぶべき課題またはタスク' },
      { name: '成長の障害', desc: '成長を妨げる障害' },
      { name: '支援の力', desc: '成長を後押しする力またはリソース' },
      { name: '結果の推定', desc: '成長後に得られる可能性のある結果' },
    ],
    scenario: '個人の心の成長の道筋を探るのに適しています',
  },
  {
    id: 'IE',
    pattern: '内面探索スプレッド',
    patternData: [
      { name: '内面の状態', desc: '現在の内面的感情または心理状態' },
      { name: '信念', desc: '行動を駆動する隠れた信念または価値観' },
      { name: '恐れ', desc: '恐れやプレッシャーで、内なる力を抑制する可能性があるもの' },
      { name: '内なる潜在能力', desc: '前進を支える長所またはリソース' },
      { name: '成長方向', desc: '内面探索によって実現できる突破口または目標' },
    ],
    scenario: '自分の内面世界を深く理解し、隠れた感情・信念・潜在力を探るのに適しています',
  },
  {
    id: 'DM',
    pattern: '決断スプレッド',
    patternData: [
      { name: '現在の状況', desc: '現在の状況または状態' },
      { name: '選択の利点', desc: '選択のポジティブ要因または利点' },
      { name: '選択の欠点', desc: '選択のネガティブ要因または欠点' },
      { name: 'その他の要因', desc: 'まだ考慮されていない潜在要因' },
      { name: '行動アドバイス', desc: '状況に応じた行動アドバイス' },
    ],
    scenario: '具体的な決断の実行可能性やメリット・デメリットを分析するのに適しています',
  },
  {
    id: 'C',
    pattern: '二択スプレッド',
    patternData: [
      { name: 'ニーズと動機', desc: 'あなたの核心的なニーズまたは動機' },
      { name: '選択1の展開', desc: '選択1の発展方向' },
      { name: '選択2の展開', desc: '選択2の発展方向' },
      { name: '結果1', desc: '選択1の最終結果' },
      { name: '結果2', desc: '選択2の最終結果' },
    ],
    scenario: '2つの選択肢の展開と結果を比較し、明確な決断を下すのに適しています',
  },
  {
    id: 'CPS',
    pattern: 'キャリアパススプレッド',
    patternData: [
      { name: '現在の状態', desc: '現在の職業状況または心境' },
      { name: '障害', desc: '前進を妨げる主な障害または困難' },
      { name: '強み', desc: '職業発展における利点またはリソース' },
      { name: '潜在能力', desc: '隠れた才能または未発見の可能性' },
      { name: '選択肢', desc: '現在考慮できる選択またはパス' },
      { name: '結果', desc: '現在のパスの可能な結果' },
      { name: 'アドバイス', desc: '次に取るべき行動または戦略' },
    ],
    scenario: '学業やキャリア発展の悩みを解決するのに適しています',
  },
  {
    id: 'TOL',
    pattern: '生命の樹スプレッド',
    patternData: [
      { name: '王冠', desc: '精神的目標または究極のビジョン' },
      { name: '知恵', desc: '相談者の直感または洞察' },
      { name: '理解', desc: '相談者の分析または判断' },
      { name: '慈悲', desc: '相談者の与える愛や寛大さ' },
      { name: '力', desc: '相談者の意志またはコントロール力' },
      { name: '美', desc: 'バランスの中心的エネルギー' },
      { name: '勝利', desc: '相談者の動機や達成' },
      { name: '栄光', desc: '相談者の表現またはコミュニケーション' },
      { name: '基礎', desc: '相談者の基盤または安心感' },
      { name: '王国', desc: '現実世界での表れまたは結果' },
    ],
    scenario: '自己や精神的成長、より高次の意味を探求するのに適しており、とても複雑な問題にのみ適用されます',
  },
  {
    id: 'CC',
    pattern: 'ケルト十字スプレッド',
    patternData: [
      { name: '現状', desc: '現在の問題の説明' },
      { name: '障害', desc: '現状に影響を与える課題や矛盾' },
      { name: '潜在意識', desc: '問題の深層的原因' },
      { name: '過去', desc: '現状に影響を与えた過去の出来事' },
      { name: '目標', desc: '期待または理想の結果' },
      { name: '未来', desc: 'まもなく起こる変化や傾向' },
      { name: '自己の状態', desc: '問題に対するあなたの見方または感情' },
      { name: '外部環境', desc: '他者が問題に与える影響' },
      { name: '希望と恐れ', desc: '心の中の期待または不安' },
      { name: '結果', desc: '事柄の最終的な展開' },
    ],
    scenario: '複雑な問題の原因と展開を包括的に分析するのに適しており、とても複雑なケースのみ対象とします',
  },
  {
    id: 'Z',
    pattern: '12ハウススプレッド',
    patternData: [
      { name: '第1ハウス（自己）', desc: 'あなたの性格、外見または態度' },
      { name: '第2ハウス（財産）', desc: '財政状況または物質的資源' },
      { name: '第3ハウス（コミュニケーション）', desc: 'コミュニケーション、学習または短距離旅行' },
      { name: '第4ハウス（家庭）', desc: '家族、住居または内面的感情' },
      { name: '第5ハウス（創造性）', desc: '趣味、創造性またはロマンス' },
      { name: '第6ハウス（仕事）', desc: '仕事、健康または日常業務' },
      { name: '第7ハウス（関係）', desc: 'パートナーシップまたは協力関係' },
      { name: '第8ハウス（変容）', desc: '変容、共有資源または深い結びつき' },
      { name: '第9ハウス（探求）', desc: '学習、旅行または精神的探求' },
      { name: '第10ハウス（キャリア）', desc: '職業、社会的地位または野心' },
      { name: '第11ハウス（社交）', desc: '友情、グループまたは未来計画' },
      { name: '第12ハウス（潜在意識）', desc: '秘密、潜在意識または精神的成長' },
    ],
    scenario: 'キャリア、感情、健康など個人生活を包括的に解釈するもので、とても複雑な問題にのみ適用されます',
  },
] as const satisfies PatternListItem[]

// Versión en español de los patrones de tiradas
export const patternListES = [
  {
    id: 'S',
    pattern: '0',
    patternData: [],
    scenario: 'Ideal para decisiones rápidas',
  },
  {
    id: 'ABS',
    pattern: 'Desarrollo de la opción A - Desarrollo de la opción B - Lectura de consejos',
    patternData: [
      { name: 'Desarrollo de la opción A', desc: 'Impacto que puede traer la opción A' },
      { name: 'Desarrollo de la opción B', desc: 'Impacto que puede traer la opción B' },
      { name: 'Consejo', desc: 'Dirección general o recomendaciones de acción concretas' },
    ],
    scenario: 'Adecuado cuando se enfrentan dos opciones; ayuda a analizar las posibles tendencias de cada una',
  },
  {
    id: 'ABCS',
    pattern: 'Desarrollo de la opción A - Desarrollo de la opción B - Desarrollo de la opción C - Lectura de consejos',
    patternData: [
      { name: 'Desarrollo de la opción A', desc: 'Impacto que puede traer la opción A' },
      { name: 'Desarrollo de la opción B', desc: 'Impacto que puede traer la opción B' },
      { name: 'Desarrollo de la opción C', desc: 'Impacto que puede traer la opción C' },
      { name: 'Consejo', desc: 'Dirección general o recomendaciones de acción concretas' },
    ],
    scenario: 'Adecuado cuando se debe decidir entre tres opciones y analizar la tendencia de cada una',
  },
  {
    id: 'TOG',
    pattern: 'Energía de hoy - Estilo de vestimenta - Guía esotérica',
    patternData: [
      { name: 'Energía de hoy', desc: 'Representa la atmósfera y energía generales del día' },
      { name: 'Estilo de vestimenta', desc: 'Estilo de ropa apropiado para hoy' },
      { name: 'Guía esotérica', desc: 'Color o prenda clave recomendados' },
    ],
    scenario: 'Ideal para ofrecer consejos de estilo relacionados con la fortuna diaria antes de salir',
  },
  {
    id: 'BNS',
    pattern: 'Impacto de compra - Impacto de renuncia - Lectura de consejos',
    patternData: [
      { name: 'Impacto de compra', desc: 'Resultados o impactos que puede traer la compra' },
      { name: 'Impacto de renuncia', desc: 'Resultados o impactos que puede traer no comprar' },
      { name: 'Consejo', desc: 'Consejos concretos de decisión de compra' },
    ],
    scenario: 'Adecuado para analizar los impactos potenciales de comprar o renunciar a un artículo cuando se duda al comprar',
  },
  {
    id: 'SAO',
    pattern: 'Situación - Acción - Resultado',
    patternData: [
      { name: 'Situación', desc: 'Entorno actual o contexto del problema' },
      { name: 'Acción', desc: 'Medidas a tomar o dirección de acción actual' },
      { name: 'Resultado', desc: 'Resultado o impacto probable si se actúa' },
    ],
    scenario: 'Adecuado para evaluar las consecuencias de actuar en una situación específica',
  },
  {
    id: 'PPF',
    pattern: 'Pasado - Presente - Futuro',
    patternData: [
      { name: 'Pasado', desc: 'Lo que ocurrió en el pasado y su impacto en la situación actual' },
      { name: 'Presente', desc: 'Núcleo de la situación o problema actual' },
      { name: 'Futuro', desc: 'Posible dirección o resultado futuro del evento' },
    ],
    scenario: 'Adecuado para explorar la tendencia de desarrollo de un evento',
  },
  {
    id: 'ORA',
    pattern: 'Obstáculo - Ayuda - Consejo',
    patternData: [
      { name: 'Obstáculo', desc: 'Obstáculo o limitación principal actual' },
      { name: 'Ayuda', desc: 'Ventajas o recursos que se pueden aprovechar' },
      { name: 'Consejo', desc: 'Dirección general o recomendaciones de acción concretas' },
    ],
    scenario: 'Adecuado para identificar los obstáculos de un asunto y cómo superarlos',
  },
  {
    id: 'TFA',
    pattern: 'Pensamiento - Emoción - Comportamiento',
    patternData: [
      { name: 'Pensamiento', desc: 'Plano racional: ideas o creencias sobre el problema' },
      { name: 'Emoción', desc: 'Reacción emocional o sentimientos internos' },
      { name: 'Comportamiento', desc: 'Manifestación externa o acciones posibles' },
    ],
    scenario: 'Adecuado para analizar las causas internas o contradicciones de una persona en pensamiento, emoción y acción',
  },
  {
    id: 'MOU',
    pattern: 'Yo - El otro - Nosotros',
    patternData: [
      { name: 'Yo', desc: 'Papel, acciones o sentimientos del consultante' },
      { name: 'El otro', desc: 'Estado, sentimientos o acciones de la otra parte' },
      { name: 'Nosotros', desc: 'Energía global de la relación o posibilidades futuras' },
    ],
    scenario: 'Adecuado para analizar la dinámica entre dos personas',
  },
  {
    id: 'TS',
    pattern: 'Lectura al núcleo',
    patternData: [
      { name: 'Núcleo del problema', desc: 'Analiza la esencia o punto clave del problema' },
      { name: 'Recursos/ventajas', desc: 'Ventajas, condiciones o apoyos disponibles' },
      { name: 'Obstáculo actual', desc: 'Dificultades o factores negativos que impiden la solución' },
      { name: 'Consejo de acción', desc: 'Solución concreta o dirección propuesta para el problema' },
    ],
    scenario: 'Ideal para identificar rápidamente la raíz de un problema y encontrar una solución',
  },
  {
    id: 'JI',
    pattern: 'Lectura de entrevista laboral',
    patternData: [
      { name: 'Actitud personal', desc: 'Actitud y preparación mental antes de la entrevista' },
      { name: 'Preparativos previos', desc: 'Aspectos a los que prestar especial atención antes de la entrevista' },
      { name: 'Dinámica de la entrevista', desc: 'Situaciones o interacciones que pueden ocurrir durante la entrevista' },
      { name: 'Expectativas del entrevistador', desc: 'Requisitos, expectativas o criterios de evaluación' },
      { name: 'Resultado potencial', desc: 'Resultado posible o tendencia tras la entrevista' },
    ],
    scenario: 'Adecuado para analizar el curso de una entrevista y los puntos clave a tener en cuenta',
  },
  {
    id: 'RD',
    pattern: 'Lectura de relación',
    patternData: [
      { name: 'Yo', desc: 'Actitud, necesidades o estado del consultante' },
      { name: 'El otro', desc: 'Actitud, necesidades o estado de la otra parte' },
      { name: 'Estado de la relación', desc: 'Patrón de interacción actual' },
      { name: 'Problemas potenciales', desc: 'Conflictos u obstáculos ocultos' },
      { name: 'Dirección futura', desc: 'Evolución posible de la relación' },
    ],
    scenario: 'Adecuado para analizar la dinámica de la relación y su dirección',
  },
  {
    id: 'LC',
    pattern: 'Cruz del Enamorado',
    patternData: [
      { name: 'Tu actitud', desc: 'Expresa tus sentimientos y actitud reales en la relación' },
      { name: 'Actitud de la otra persona', desc: 'Sentimientos, actitud y acciones de la otra persona' },
      { name: 'Estado de la relación', desc: 'Situación concreta o rasgos principales de la relación' },
      { name: 'Problema existente', desc: 'Conflictos o dificultades que afectan la relación' },
      { name: 'Desarrollo futuro', desc: 'Dirección o tendencia futura posible de la relación' },
    ],
    scenario: 'Adecuado para analizar la dirección de una relación',
  },
  {
    id: 'GA',
    pattern: 'Lectura de cumplimiento de objetivos',
    patternData: [
      { name: 'Objetivo', desc: 'Significado o esencia central del objetivo' },
      { name: 'Motivación', desc: 'Motivaciones que te impulsan' },
      { name: 'Obstáculo', desc: 'Dificultades o limitaciones actuales' },
      { name: 'Recursos', desc: 'Recursos o apoyos necesarios' },
      { name: 'Resultado', desc: 'Estado o resultado tras lograr el objetivo' },
    ],
    scenario: 'Adecuado para analizar la ruta hacia el logro de un objetivo',
  },
  {
    id: 'P',
    pattern: 'Lectura de progreso',
    patternData: [
      { name: 'Estado actual', desc: 'Etapa o estado actual' },
      { name: 'Logrado', desc: 'Progreso y logros alcanzados' },
      { name: 'Pendiente', desc: 'Problemas aún sin resolver' },
      { name: 'Dirección del progreso', desc: 'Dirección en la que se debe trabajar' },
      { name: 'Proyección de resultados', desc: 'Resultado final probable' },
    ],
    scenario: 'Adecuado para analizar el progreso de un proyecto, relación o crecimiento personal',
  },
  {
    id: 'SG',
    pattern: 'Lectura de crecimiento del alma',
    patternData: [
      { name: 'Estado del alma', desc: 'Estado actual del alma o interior' },
      { name: 'Lección de crecimiento', desc: 'Lección o tarea a aprender' },
      { name: 'Obstáculo al crecimiento', desc: 'Obstáculo que afecta el crecimiento' },
      { name: 'Fuerza de apoyo', desc: 'Fuerzas o recursos que impulsan el crecimiento' },
      { name: 'Proyección de resultados', desc: 'Resultado posible tras el crecimiento' },
    ],
    scenario: 'Adecuado para explorar la ruta de crecimiento del alma personal',
  },
  {
    id: 'IE',
    pattern: 'Lectura de exploración interior',
    patternData: [
      { name: 'Estado interno', desc: 'Emoción interna o estado psicológico actual' },
      { name: 'Creencias', desc: 'Creencias o valores que conducen el comportamiento' },
      { name: 'Miedos', desc: 'Miedos o presiones que pueden suprimir el poder interior' },
      { name: 'Potencial interno', desc: 'Virtudes o recursos que pueden apoyarte' },
      { name: 'Dirección de crecimiento', desc: 'Objetivos que se pueden lograr mediante la exploración interna' },
    ],
    scenario: 'Adecuado para comprender profundamente el mundo interior y explorar emociones, creencias y potencial ocultos',
  },
  {
    id: 'DM',
    pattern: 'Lectura de decisiones',
    patternData: [
      { name: 'Situación actual', desc: 'Situación o estado actual' },
      { name: 'Ventajas de la elección', desc: 'Factores positivos o ventajas' },
      { name: 'Desventajas de la elección', desc: 'Factores negativos o desventajas' },
      { name: 'Otros factores', desc: 'Factores potenciales no considerados' },
      { name: 'Consejo de acción', desc: 'Recomendaciones basadas en la situación' },
    ],
    scenario: 'Ayuda a analizar la viabilidad y los pros y contras de una decisión específica',
  },
  {
    id: 'C',
    pattern: 'Lectura de elección binaria',
    patternData: [
      { name: 'Motivación o necesidad', desc: 'Tu necesidad o motivación principal' },
      { name: 'Desarrollo 1', desc: 'Dirección de desarrollo de la opción 1' },
      { name: 'Desarrollo 2', desc: 'Dirección de desarrollo de la opción 2' },
      { name: 'Resultado 1', desc: 'Resultado final de la opción 1' },
      { name: 'Resultado 2', desc: 'Resultado final de la opción 2' },
    ],
    scenario: 'Adecuado para sopesar las dos opciones y ayudar a tomar una decisión clara',
  },
  {
    id: 'CPS',
    pattern: 'Lectura de trayectoria profesional',
    patternData: [
      { name: 'Estado actual', desc: 'Estado o mentalidad profesional actual' },
      { name: 'Obstáculo', desc: 'Obstáculos o dificultades principales' },
      { name: 'Ventajas', desc: 'Ventajas o recursos profesionales' },
      { name: 'Potencial', desc: 'Talentos ocultos o posibilidades sin descubrir' },
      { name: 'Opciones', desc: 'Opciones o caminos a considerar' },
      { name: 'Resultado', desc: 'Resultado probable según el camino actual' },
      { name: 'Consejo', desc: 'Acción o estrategia a seguir' },
    ],
    scenario: 'Adecuado para resolver dudas en estudios y desarrollo profesional',
  },
  {
    id: 'TOL',
    pattern: 'Lectura del Árbol de la Vida',
    patternData: [
      { name: 'Corona', desc: 'Meta espiritual o visión final' },
      { name: 'Sabiduría', desc: 'Intuición o conocimiento del consultante' },
      { name: 'Comprensión', desc: 'Análisis o juicio del consultante' },
      { name: 'Misericordia', desc: 'Entrega y amor del consultante' },
      { name: 'Fuerza', desc: 'Voluntad o capacidad de control' },
      { name: 'Belleza', desc: 'Fuerza central de equilibrio' },
      { name: 'Victoria', desc: 'Impulso y logros del consultante' },
      { name: 'Gloria', desc: 'Expresión o comunicación del consultante' },
      { name: 'Base', desc: 'Base o sensación de seguridad' },
      { name: 'Reino', desc: 'Manifestación o resultado en el mundo real' },
    ],
    scenario: 'Adecuada para explorar el yo, el crecimiento espiritual y significados más elevados; solo para preguntas muy complejas',
  },
  {
    id: 'CC',
    pattern: 'Cruz Celta',
    patternData: [
      { name: 'Situación', desc: 'Descripción del problema actual' },
      { name: 'Obstáculo', desc: 'Desafíos o contradicciones que afectan la situación' },
      { name: 'Subconsciente', desc: 'Causa profunda del problema' },
      { name: 'Pasado', desc: 'Eventos pasados que influyen en la situación' },
      { name: 'Objetivo', desc: 'Resultado deseado o ideal' },
      { name: 'Futuro', desc: 'Cambios o tendencias próximas' },
      { name: 'Estado personal', desc: 'Tu percepción o sentimientos sobre el problema' },
      { name: 'Entorno externo', desc: 'Influencia de otros en el problema' },
      { name: 'Esperanzas y miedos', desc: 'Expectativas o preocupaciones internas' },
      { name: 'Resultado', desc: 'Desarrollo final probable de la situación' },
    ],
    scenario: 'Adecuada para analizar de forma integral problemas complejos; solo para cuestiones muy complejas',
  },
  {
    id: 'Z',
    pattern: 'Lectura de las Doce Casas',
    patternData: [
      { name: 'Casa I (Yo)', desc: 'Personalidad, apariencia o actitud' },
      { name: 'Casa II (Riqueza)', desc: 'Situación financiera o recursos materiales' },
      { name: 'Casa III (Comunicación)', desc: 'Comunicación, aprendizaje o viajes cortos' },
      { name: 'Casa IV (Familia)', desc: 'Familia, hogar o emociones internas' },
      { name: 'Casa V (Creatividad)', desc: 'Hobbies, creatividad o romance' },
      { name: 'Casa VI (Trabajo)', desc: 'Trabajo, salud o asuntos cotidianos' },
      { name: 'Casa VII (Relaciones)', desc: 'Pareja o colaboración' },
      { name: 'Casa VIII (Transformación)', desc: 'Cambios, recursos compartidos o conexiones profundas' },
      { name: 'Casa IX (Exploración)', desc: 'Estudio, viajes o búsqueda espiritual' },
      { name: 'Casa X (Carrera)', desc: 'Carrera, estatus social o ambición' },
      { name: 'Casa XI (Social)', desc: 'Amistades, asociaciones o planificación futura' },
      { name: 'Casa XII (Inconsciente)', desc: 'Secretos, subconsciente o crecimiento espiritual' },
    ],
    scenario: 'Cubre una interpretación integral de la vida personal; solo para cuestiones muy complejas',
  },
] as const satisfies PatternListItem[]

export function getPatternById(id: string, lang: Locale): PatternListItem | undefined {
  switch (lang) {
    case Locale.ChineseSimplified:
      return patternListCN.find(p => p.id === id) as PatternListItem | undefined
    case Locale.ChineseTraditional:
      return patternListTW.find(p => p.id === id) as PatternListItem | undefined
    case Locale.Korean:
      return patternListKR.find(p => p.id === id) as PatternListItem | undefined
    case Locale.Japanese:
      return patternListJP.find(p => p.id === id) as PatternListItem | undefined
    case Locale.Spanish:
      return patternListES.find(p => p.id === id) as PatternListItem | undefined
    default:
      return patternListEN.find(p => p.id === id) as PatternListItem | undefined
  }
}

export function getPatternByName(name: string, lang: Locale): PatternListItem {
  let p: PatternListItem | undefined
  switch (lang) {
    case Locale.ChineseSimplified:
      p = patternListCN.find(p => p.pattern === name)
      break
    case Locale.ChineseTraditional:
      p = patternListTW.find(p => p.pattern === name)
      break
    case Locale.Korean:
      p = patternListKR.find(p => p.pattern === name)
      break
    case Locale.Japanese:
      p = patternListJP.find(p => p.pattern === name)
      break
    case Locale.Spanish:
      p = patternListES.find(p => p.pattern === name)
      break
    default:
      p = patternListEN.find(p => p.pattern === name)
  }
  if (p) {
    return p as any
  }
  return patternListEN[0] as any
}

// 使用牌阵的插槽名来匹配完全等价的牌阵数据（目前接口缺少传递牌阵 ID），只能这样反向查找牌阵
export function matchByPatternData(args: { patternData: { name: string }[]; lang?: Locale }) {
  const { patternData, lang } = args
  let patternList
  switch (lang) {
    case Locale.English:
      patternList = patternListEN
      break
    case Locale.ChineseTraditional:
      patternList = patternListTW
      break
    case Locale.Korean:
      patternList = patternListKR
      break
    case Locale.Japanese:
      patternList = patternListJP
      break
    case Locale.Spanish:
      patternList = patternListES
      break
    default:
      patternList = patternListCN
  }
  return patternList.find(p => {
    if (p.patternData.length !== patternData.length) {
      return false
    }
    return p.patternData.every((item, index) => {
      const data = patternData[index]
      return item.name === data.name
    })
  })
}