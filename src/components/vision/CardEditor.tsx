'use client';

import { useState, useEffect } from 'react';
import { CorrectedCard } from '@/lib/review-types';
import { getAllCardOptions, searchCards, CardOption } from '@/lib/card-selector';

interface CardEditorProps {
  card: CorrectedCard | null;
  onSave: (card: CorrectedCard) => void;
  onCancel: () => void;
}

export function CardEditor({ card, onSave, onCancel }: CardEditorProps) {
  const [position, setPosition] = useState(card?.position || 1);
  const [selectedCard, setSelectedCard] = useState<CardOption | null>(null);
  const [orientation, setOrientation] = useState<'upright' | 'reversed'>(
    card?.orientation || 'upright'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CardOption[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // 初始化
  useEffect(() => {
    if (card) {
      setSelectedCard({
        cnName: card.cardNameCn,
        enName: card.cardNameEn,
        key: '',
      });
      setSearchQuery(card.cardNameCn);
    } else {
      setSearchResults(getAllCardOptions().slice(0, 10));
    }
  }, [card]);

  // 搜索卡牌
  useEffect(() => {
    const results = searchCards(searchQuery);
    setSearchResults(results.slice(0, 20));
    setShowDropdown(true);
  }, [searchQuery]);

  // 选择卡牌
  const handleSelectCard = (cardOption: CardOption) => {
    setSelectedCard(cardOption);
    setSearchQuery(cardOption.cnName);
    setShowDropdown(false);
  };

  // 保存
  const handleSave = () => {
    if (!selectedCard) {
      alert('请选择卡牌');
      return;
    }

    if (position < 1 || position > 20) {
      alert('位置必须在 1-20 之间');
      return;
    }

    const newCard: CorrectedCard = {
      position,
      cardNameCn: selectedCard.cnName,
      cardNameEn: selectedCard.enName,
      orientation,
      source: card?.source || 'manual',
      edited: true,
    };

    onSave(newCard);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {card ? '编辑卡牌' : '添加卡牌'}
        </h3>

        <div className="space-y-4">
          {/* 位置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">位置</label>
            <input
              type="number"
              value={position}
              onChange={e => setPosition(parseInt(e.target.value) || 1)}
              min={1}
              max={20}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          {/* 卡牌名称搜索 */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">卡牌名称</label>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              placeholder="搜索卡牌..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />

            {/* 搜索结果下拉 */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((cardOption, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectCard(cardOption)}
                    className="px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="font-medium text-sm">{cardOption.cnName}</div>
                    <div className="text-xs text-gray-600">{cardOption.enName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 正逆位 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">正逆位</label>
            <div className="flex gap-3">
              <button
                onClick={() => setOrientation('upright')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                  orientation === 'upright'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                正位
              </button>
              <button
                onClick={() => setOrientation('reversed')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                  orientation === 'reversed'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                逆位
              </button>
            </div>
          </div>

          {/* 预览 */}
          {selectedCard && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <div className="text-xs text-indigo-600 mb-1">预览</div>
              <div className="font-medium">
                {position}. {selectedCard.cnName}
              </div>
              <div className="text-sm text-gray-600">
                {orientation === 'upright' ? '正位' : '逆位'}
                {' • '}
                {selectedCard.enName}
              </div>
            </div>
          )}
        </div>

        {/* 按钮 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedCard}
            className="flex-1 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     text-white font-medium transition"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
