'use client';

import { useState, useEffect, useMemo } from 'react';
import { AVAILABLE_MODELS, ModelConfig } from '@/lib/models';
import { MultiModelResponse, ModelResult, DrawnCard, getAllCardOptions, CardOption } from '@/lib/tarot';
import { getLayoutOptionsCN, getLayoutDetails, buildPatternLayoutAnalysis } from '@/lib/layout-utils';

// 手动选牌组件
function ManualCardSelector({
  cardCount,
  manualCards,
  onChange,
}: {
  cardCount: number;
  manualCards: DrawnCard[];
  onChange: (cards: DrawnCard[]) => void;
}) {
  const allCards = useMemo(() => getAllCardOptions(), []);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  // 当 cardCount 变化时，调整 manualCards 数组长度
  useEffect(() => {
    if (manualCards.length !== cardCount) {
      const newCards = [...manualCards];
      if (newCards.length < cardCount) {
        // 添加空卡位
        for (let i = newCards.length; i < cardCount; i++) {
          newCards.push({
            enName: '',
            cnName: '',
            isUpright: true,
            arcana: 'Major',
            rank: null,
          });
        }
      } else {
        // 截断多余的
        newCards.length = cardCount;
      }
      onChange(newCards);
      setSearchTerms(new Array(cardCount).fill(''));
    }
  }, [cardCount, manualCards.length, onChange]);

  // 获取已选择的牌名列表（用于禁用重复选项）
  const selectedCardNames = manualCards.map(c => c.enName).filter(Boolean);

  const handleCardChange = (index: number, enName: string) => {
    const card = allCards.find(c => c.enName === enName);
    if (!card) return;

    const newCards = [...manualCards];
    newCards[index] = {
      enName: card.enName,
      cnName: card.cnName,
      isUpright: newCards[index]?.isUpright ?? true,
      arcana: card.arcana,
      rank: card.rank,
    };
    onChange(newCards);
  };

  const handleOrientationChange = (index: number, isUpright: boolean) => {
    const newCards = [...manualCards];
    if (newCards[index]) {
      newCards[index] = { ...newCards[index], isUpright };
      onChange(newCards);
    }
  };

  const handleSearchChange = (index: number, term: string) => {
    const newTerms = [...searchTerms];
    newTerms[index] = term;
    setSearchTerms(newTerms);
  };

  const getFilteredCards = (index: number) => {
    const term = (searchTerms[index] || '').toLowerCase();
    return allCards.filter(card => {
      const matchesSearch = !term ||
        card.enName.toLowerCase().includes(term) ||
        card.cnName.includes(term);
      const isDisabled = selectedCardNames.includes(card.enName) &&
        manualCards[index]?.enName !== card.enName;
      return matchesSearch && !isDisabled;
    });
  };

  return (
    <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
      <div className="text-sm font-medium text-amber-800 mb-3">
        手动选择 {cardCount} 张牌
      </div>
      <div className="space-y-3">
        {Array.from({ length: cardCount }).map((_, index) => {
          const currentCard = manualCards[index];
          const filteredCards = getFilteredCards(index);

          return (
            <div key={index} className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-gray-600 w-16 flex-shrink-0">
                第 {index + 1} 张:
              </span>

              {/* 牌选择下拉 */}
              <div className="flex-1 min-w-[200px] relative">
                <input
                  type="text"
                  placeholder="搜索牌名..."
                  value={searchTerms[index] || ''}
                  onChange={e => handleSearchChange(index, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none text-gray-900 text-sm"
                />
                {(searchTerms[index] || !currentCard?.enName) && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredCards.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">无匹配结果</div>
                    ) : (
                      filteredCards.slice(0, 20).map(card => (
                        <button
                          key={card.enName}
                          onClick={() => {
                            handleCardChange(index, card.enName);
                            handleSearchChange(index, '');
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 flex justify-between items-center"
                        >
                          <span className="text-gray-900">{card.cnName}</span>
                          <span className="text-gray-500 text-xs">{card.enName}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* 已选择的牌显示 */}
              {currentCard?.enName && !searchTerms[index] && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700">
                    {currentCard.cnName} ({currentCard.enName})
                  </span>
                  <button
                    onClick={() => handleSearchChange(index, ' ')}
                    className="text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    更换
                  </button>
                </div>
              )}

              {/* 正逆位切换 */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOrientationChange(index, true)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    currentCard?.isUpright
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  正位
                </button>
                <button
                  onClick={() => handleOrientationChange(index, false)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    !currentCard?.isUpright
                      ? 'bg-rose-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  逆位
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 验证提示 */}
      {manualCards.some(c => !c.enName) && (
        <p className="mt-3 text-sm text-amber-700">
          请为所有位置选择牌
        </p>
      )}
    </div>
  );
}

function LayoutSelector({
  selectedLayoutId,
  onLayoutChange,
  language,
  onLanguageChange,
  currentQuestion
}: {
  selectedLayoutId: string;
  onLayoutChange: (
    layoutId: string,
    layoutName: string,
    analysis: string,
    cardCount: number
  ) => void;
  language: 'cn' | 'en';
  onLanguageChange: (lang: 'cn' | 'en') => void;
  currentQuestion: string;
}) {
  const layoutOptions = getLayoutOptionsCN();

  const handleLayoutSelect = (layoutId: string) => {
    if (!layoutId) {
      onLayoutChange('', '', '', 3);
      return;
    }

    const layout = getLayoutDetails(layoutId);
    if (!layout) return;

    const analysis = buildPatternLayoutAnalysis(
      layoutId,
      language,
      currentQuestion || '你的问题'
    );

    onLayoutChange(
      layoutId,
      layout.name,
      analysis,
      layout.cardCount
    );
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          选择牌阵（可选）
        </label>

        {/* 语言切换开关 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">解读语言:</span>
          <button
            onClick={() => onLanguageChange('cn')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              language === 'cn'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            中文
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              language === 'en'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* 下拉选择器 */}
      <select
        value={selectedLayoutId}
        onChange={e => handleLayoutSelect(e.target.value)}
        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-gray-900"
      >
        <option value="">自定义牌阵（手动输入）</option>
        {layoutOptions.map(layout => (
          <option key={layout.id} value={layout.id}>
            {layout.name} ({layout.cardCount}张) - {layout.scenario.slice(0, 30)}...
          </option>
        ))}
      </select>

      {/* 选中牌阵后显示详细信息 */}
      {selectedLayoutId && (
        <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="text-xs text-blue-800">
            {(() => {
              const layout = getLayoutDetails(selectedLayoutId);
              return layout ? (
                <>
                  <div className="font-medium mb-1">{layout.name}</div>
                  <div className="mb-2">{layout.scenario}</div>
                  <div className="text-blue-700">
                    牌数：{layout.cardCount}张 |{' '}
                    位置：{layout.positions.map(p => p.name).join('、')}
                  </div>
                </>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function ModelSelector({
  models,
  selected,
  onChange
}: {
  models: ModelConfig[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-3 text-gray-700">
        选择 AI 模型（可多选）
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {models.map(model => {
          const isSelected = selected.includes(model.id);

          return (
            <label
              key={model.id}
              className={`
                relative flex items-start p-4 rounded-lg border-2 cursor-pointer
                transition-all
                ${isSelected
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={e => {
                  if (e.target.checked) {
                    onChange([...selected, model.id]);
                  } else {
                    onChange(selected.filter(id => id !== model.id));
                  }
                }}
                className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />

              <div className="ml-3 flex-1">
                <div className="font-medium text-gray-900">{model.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {model.vendor} · {model.speed}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {model.description}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {selected.length === 0 && (
        <p className="mt-2 text-sm text-red-600">
          请至少选择一个模型
        </p>
      )}
    </div>
  );
}

function LoadingIndicator({
  selectedModels,
  batchCount
}: {
  selectedModels: string[];
  batchCount: number;
}) {
  const totalCalls = selectedModels.length * batchCount;

  return (
    <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
          <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>

        <div className="text-2xl font-semibold text-gray-900 mb-2">
          解读中...
        </div>

        <div className="text-sm text-gray-500">
          正在调用 {selectedModels.length} 个模型，每个 {batchCount} 次
          （共 {totalCalls} 次 API 调用）
        </div>
      </div>

      <div className="space-y-3">
        {selectedModels.map(modelId => {
          const model = AVAILABLE_MODELS.find(m => m.id === modelId);
          return (
            <div key={modelId}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-700 font-medium">{model?.name || modelId}</span>
                <span className="text-gray-500">预计 {batchCount * 3}s</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full animate-pulse" style={{ width: '100%' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModelResultColumn({
  modelId,
  modelData,
  selectedBatch,
  onBatchChange,
  comparisonMode
}: {
  modelId: string;
  modelData: ModelResult;
  selectedBatch: number;
  onBatchChange: (index: number) => void;
  comparisonMode?: boolean;
}) {
  // 对比模式: 左右分栏显示
  if (comparisonMode && modelData.calls.length === 2) {
    const withMeaning = modelData.calls[0];  // 有牌意
    const withoutMeaning = modelData.calls[1];  // 无牌意

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        {/* 模型头部信息 */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <h3 className="font-semibold text-lg text-gray-900">
            {modelData.modelName}
          </h3>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            对比模式
          </span>
        </div>

        {/* 左右分栏 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 左侧: 有牌意 */}
          <div className="border-r lg:pr-4">
            <div className="mb-3 pb-2 border-b">
              <span className="text-sm font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                ✓ 有牌意
              </span>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                {withMeaning.response}
              </p>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                查看 System Prompt
              </summary>
              <pre className="mt-2 p-3 rounded-lg bg-gray-50 text-xs overflow-x-auto whitespace-pre-wrap text-gray-600 border border-gray-200">
                {withMeaning.systemPrompt}
              </pre>
            </details>
          </div>

          {/* 右侧: 无牌意 */}
          <div className="lg:pl-4">
            <div className="mb-3 pb-2 border-b">
              <span className="text-sm font-medium text-orange-700 bg-orange-50 px-2 py-1 rounded">
                ✗ 无牌意
              </span>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                {withoutMeaning.response}
              </p>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                查看 System Prompt
              </summary>
              <pre className="mt-2 p-3 rounded-lg bg-gray-50 text-xs overflow-x-auto whitespace-pre-wrap text-gray-600 border border-gray-200">
                {withoutMeaning.systemPrompt}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // 正常模式: 原有逻辑
  const currentResult = modelData.calls[selectedBatch];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <h3 className="font-semibold text-lg text-gray-900">
          {modelData.modelName}
        </h3>

        {modelData.error ? (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            失败
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            成功 {modelData.stats.successCalls}/{modelData.stats.totalCalls}
          </span>
        )}
      </div>

      {modelData.calls.length > 1 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">批次选择:</div>
          <div className="flex flex-wrap gap-2">
            {modelData.calls.map((_, index) => (
              <button
                key={index}
                onClick={() => onBatchChange(index)}
                className={`
                  px-3 py-1 rounded-md text-sm font-medium transition-colors
                  ${selectedBatch === index
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {modelData.error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-medium text-red-900 mb-1">调用失败</h4>
              <p className="text-sm text-red-700">{modelData.error}</p>
            </div>
          </div>
        </div>
      ) : currentResult ? (
        <>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {currentResult.response}
            </p>
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              查看 System Prompt
            </summary>
            <pre className="mt-2 p-4 rounded-lg bg-gray-50 text-xs overflow-x-auto whitespace-pre-wrap text-gray-600 border border-gray-200">
              {currentResult.systemPrompt}
            </pre>
          </details>
        </>
      ) : (
        <p className="text-gray-500 text-sm">无数据</p>
      )}
    </div>
  );
}

function ResultsSection({ data, comparisonMode }: {
  data: MultiModelResponse;
  comparisonMode?: boolean;
}) {
  const [selectedBatches, setSelectedBatches] = useState<Record<string, number>>({});

  useEffect(() => {
    const initial: Record<string, number> = {};
    Object.keys(data.results).forEach(modelId => {
      initial[modelId] = 0;
    });
    setSelectedBatches(initial);
  }, [data]);

  const downloadResults = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `tarot-multimodel-${timestamp}.json`;

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          抽到的牌（所有模型共用）
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.sharedCards.map((card, i) => (
            <span
              key={i}
              className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${card.isUpright
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-100 text-rose-700 border border-rose-200'
                }
              `}
            >
              {card.isUpright ? '正位' : '逆位'} {card.enName}
            </span>
          ))}
        </div>
      </div>

      {/* 对比模式提示 */}
      {comparisonMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">对比模式已启用</h4>
              <p className="text-sm text-blue-700">
                每个模型生成了两个版本：左侧为"有牌意"版本（包含完整牌意信息），右侧为"无牌意"版本（仅包含牌名）。
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={`grid gap-6 ${comparisonMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {Object.entries(data.results).map(([modelId, modelData]) => (
          <ModelResultColumn
            key={modelId}
            modelId={modelId}
            modelData={modelData}
            selectedBatch={selectedBatches[modelId] || 0}
            onBatchChange={batchIndex =>
              setSelectedBatches(prev => ({ ...prev, [modelId]: batchIndex }))
            }
            comparisonMode={comparisonMode}
          />
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={downloadResults}
          className="px-6 py-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700 font-medium"
        >
          再次下载 JSON
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [question, setQuestion] = useState('');
  const [cardCount, setCardCount] = useState(3);
  const [batchCount, setBatchCount] = useState(1);
  const [selectedModels, setSelectedModels] = useState<string[]>([
    'anthropic/claude-sonnet-4'
  ]);
  const [modelResults, setModelResults] = useState<MultiModelResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 新增的 Prompt 配置字段
  const [hookQuestion, setHookQuestion] = useState('');
  const [additionalQuestionTextInfo, setAdditionalQuestionTextInfo] = useState('');
  const [cardLayoutName, setCardLayoutName] = useState('自由牌阵');
  const [cardPatternLayoutAnalysis, setCardPatternLayoutAnalysis] = useState('这是一个自由牌阵，每张牌的位置都代表着问题的不同方面。');
  const [timeInfo, setTimeInfo] = useState(`当前时间：${new Date().toLocaleDateString('zh-CN')}`);
  const [language, setLanguage] = useState('中文');

  // 牌阵选择相关状态
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>('');
  const [layoutLanguage, setLayoutLanguage] = useState<'cn' | 'en'>('cn');

  // 是否拼接牌意
  const [includeCardMeaning, setIncludeCardMeaning] = useState(true);

  // 对比模式
  const [comparisonMode, setComparisonMode] = useState(false);

  // 手动选牌模式
  const [manualMode, setManualMode] = useState(false);
  const [manualCards, setManualCards] = useState<DrawnCard[]>([]);

  // 牌阵选择变化处理
  const handleLayoutChange = (
    layoutId: string,
    layoutName: string,
    analysis: string,
    suggestedCardCount: number
  ) => {
    setSelectedLayoutId(layoutId);

    if (layoutId) {
      setCardLayoutName(layoutName);
      setCardPatternLayoutAnalysis(analysis);
      setCardCount(suggestedCardCount);
    } else {
      setCardLayoutName('自由牌阵');
      setCardPatternLayoutAnalysis('这是一个自由牌阵，每张牌的位置都代表着问题的不同方面。');
    }
  };

  // 语言切换处理
  const handleLanguageChange = (lang: 'cn' | 'en') => {
    setLayoutLanguage(lang);

    if (selectedLayoutId) {
      const analysis = buildPatternLayoutAnalysis(
        selectedLayoutId,
        lang,
        question || '你的问题'
      );
      setCardPatternLayoutAnalysis(analysis);
    }

    setLanguage(lang === 'cn' ? '中文' : 'English');
  };

  const handleSubmit = async () => {
    if (selectedModels.length === 0) {
      setError('请至少选择一个 AI 模型');
      return;
    }

    if (!question.trim()) {
      setError('请输入你的问题');
      return;
    }

    // 手动模式验证
    if (manualMode) {
      if (manualCards.length !== cardCount) {
        setError('手动选牌数量与设置不符');
        return;
      }
      if (manualCards.some(c => !c.enName)) {
        setError('请为所有位置选择牌');
        return;
      }
    }

    const totalCalls = selectedModels.length * batchCount;
    if (totalCalls > 20) {
      setError(`总调用次数过多 (${totalCalls} 次)，请减少模型或批量数`);
      return;
    }

    setLoading(true);
    setError('');
    setModelResults(null);

    try {
      const response = await fetch('/api/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          cardCount,
          batchCount,
          models: selectedModels,
          hookQuestion,
          additionalQuestionTextInfo,
          cardLayoutName,
          cardPatternLayoutAnalysis,
          timeInfo,
          language,
          layoutId: selectedLayoutId,
          includeCardMeaning,
          comparisonMode,
          manualCards: manualMode ? manualCards : undefined
        })
      });

      const data: MultiModelResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API 请求失败');
      }

      setModelResults(data);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `tarot-multimodel-${timestamp}.json`;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-900">
          Tarot Reading
        </h1>
        <p className="text-center text-gray-600 mb-8">
          AI-Powered Multi-Model Comparison
        </p>

        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-200">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              你的问题
            </label>
            <textarea
              value={question}
              onChange={e => {
                setQuestion(e.target.value);
                // 实时更新解读思路中的 {{question}}
                if (selectedLayoutId) {
                  const analysis = buildPatternLayoutAnalysis(
                    selectedLayoutId,
                    layoutLanguage,
                    e.target.value
                  );
                  setCardPatternLayoutAnalysis(analysis);
                }
              }}
              placeholder="请输入你想问的问题..."
              className="w-full h-24 px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none text-gray-900"
            />
          </div>

          {/* 牌阵选择器 */}
          <LayoutSelector
            selectedLayoutId={selectedLayoutId}
            onLayoutChange={handleLayoutChange}
            language={layoutLanguage}
            onLanguageChange={handleLanguageChange}
            currentQuestion={question}
          />

          {/* 背景问题 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              背景问题（可选）
            </label>
            <input
              type="text"
              value={hookQuestion}
              onChange={e => setHookQuestion(e.target.value)}
              placeholder="例如：你和对方认识多久了？"
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-gray-900"
            />
          </div>

          {/* 背景问题的回答 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              背景信息（可选）
            </label>
            <textarea
              value={additionalQuestionTextInfo}
              onChange={e => setAdditionalQuestionTextInfo(e.target.value)}
              placeholder="用户对背景问题的回答..."
              className="w-full h-20 px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none text-gray-900"
            />
          </div>

          {/* 牌阵名称 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              牌阵名称
            </label>
            <input
              type="text"
              value={cardLayoutName}
              onChange={e => setCardLayoutName(e.target.value)}
              placeholder="例如：时间之流牌阵、凯尔特十字..."
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-gray-900"
            />
          </div>

          {/* 牌阵解读思路 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              牌阵解读思路
            </label>
            <textarea
              value={cardPatternLayoutAnalysis}
              onChange={e => setCardPatternLayoutAnalysis(e.target.value)}
              placeholder="描述每个位置的含义，例如：第1张代表过去，第2张代表现在..."
              className="w-full h-24 px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none text-gray-900"
            />
          </div>

          {/* 是否拼接牌意 */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCardMeaning}
                onChange={e => setIncludeCardMeaning(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">
                拼接详细牌意到 Prompt（推荐）
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              勾选后会在 Prompt 中包含每张牌的完整牌意信息，AI 解读更准确但会增加 token 消耗
            </p>

            {/* 对比模式开关 */}
            <label className="flex items-center gap-2 cursor-pointer mt-3">
              <input
                type="checkbox"
                checked={comparisonMode}
                onChange={e => setComparisonMode(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">
                对比模式 - 同时生成"有牌意"和"无牌意"两个版本
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              勾选后会生成两个版本的解读结果并左右对比显示（消耗 2x token）
            </p>
          </div>

          {/* 时间信息 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              时间信息
            </label>
            <input
              type="text"
              value={timeInfo}
              onChange={e => setTimeInfo(e.target.value)}
              placeholder="当前时间或节日信息..."
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-gray-900"
            />
          </div>

          {/* 输出语言 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              输出语言
            </label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-gray-900"
            >
              <option value="中文">中文</option>
              <option value="English">English</option>
              <option value="日本語">日本語</option>
            </select>
          </div>

          <ModelSelector
            models={AVAILABLE_MODELS}
            selected={selectedModels}
            onChange={setSelectedModels}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                抽牌数量
              </label>
              <input
                type="number"
                min={1}
                max={78}
                value={cardCount}
                onChange={e => setCardCount(Math.min(78, Math.max(1, Number(e.target.value))))}
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                每个模型调用次数
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={batchCount}
                onChange={e => setBatchCount(Math.min(10, Math.max(1, Number(e.target.value))))}
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-gray-900"
              />
            </div>
          </div>

          {/* 手动选牌模式 */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={manualMode}
                onChange={e => setManualMode(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">
                手动选牌模式
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              勾选后可以手动指定每张牌及其正逆位，而不是随机抽取
            </p>
          </div>

          {/* 手动选牌选择器 */}
          {manualMode && (
            <ManualCardSelector
              cardCount={cardCount}
              manualCards={manualCards}
              onChange={setManualCards}
            />
          )}

          {selectedModels.length > 0 && (
            <div className="mb-6 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">
                将进行 <strong>{selectedModels.length} × {batchCount} = {selectedModels.length * batchCount}</strong> 次 API 调用
                （预计耗时 {Math.ceil(batchCount * 3)} 秒）
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || selectedModels.length === 0}
            className="w-full py-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-medium text-lg transition-colors"
          >
            {loading ? '解读中...' : '开始塔罗解读'}
          </button>

          {error && (
            <p className="mt-4 text-red-600 text-center text-sm">{error}</p>
          )}
        </div>

        {loading && (
          <LoadingIndicator
            selectedModels={selectedModels}
            batchCount={batchCount}
          />
        )}

        {!loading && modelResults && (
          <ResultsSection data={modelResults} comparisonMode={comparisonMode} />
        )}
      </main>
    </div>
  );
}
