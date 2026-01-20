'use client';

import { useState, useEffect } from 'react';
import { ReviewDetailResponse, ReviewImage, CorrectedCard } from '@/lib/review-types';
import { CardEditor } from './CardEditor';

interface ReviewEditorProps {
  detail: ReviewDetailResponse;
  currentImage: ReviewImage;
  onSaveSuccess: (nextImage?: ReviewImage) => void;
}

export function ReviewEditor({ detail, currentImage, onSaveSuccess }: ReviewEditorProps) {
  const [correctedCards, setCorrectedCards] = useState<CorrectedCard[]>([]);
  const [showCardEditor, setShowCardEditor] = useState(false);
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState('');

  // 初始化校对结果
  useEffect(() => {
    if (detail.existingCorrection) {
      // 如果已有校对结果，加载它
      setCorrectedCards(detail.existingCorrection.correctedLabel.cards);
      setNotes(detail.existingCorrection.reviewInfo.notes || '');
    } else {
      // 否则默认使用第一次识别结果
      setCorrectedCards(
        detail.firstAnnotation.cards
          .filter(card => card.cardNameCn && card.cardNameEn)
          .map(card => ({
            position: card.position,
            cardNameCn: card.cardNameCn!,
            cardNameEn: card.cardNameEn!,
            orientation: card.orientation === 'unknown' ? 'upright' : card.orientation,
            source: 'first' as const,
            edited: false,
          }))
      );
      setNotes('');
    }
  }, [detail]);

  // 从第一次/第二次识别中添加卡牌
  const handleAddCardFromAnnotation = (
    card: (typeof detail.firstAnnotation.cards)[0],
    source: 'first' | 'second'
  ) => {
    if (!card.cardNameCn || !card.cardNameEn) {
      alert('该卡牌缺少名称信息');
      return;
    }

    // 检查是否已存在相同位置的卡牌
    const existingIndex = correctedCards.findIndex(c => c.position === card.position);

    const newCard: CorrectedCard = {
      position: card.position,
      cardNameCn: card.cardNameCn,
      cardNameEn: card.cardNameEn,
      orientation: card.orientation === 'unknown' ? 'upright' : card.orientation,
      source,
      edited: false,
    };

    if (existingIndex >= 0) {
      // 替换现有卡牌
      const updated = [...correctedCards];
      updated[existingIndex] = newCard;
      setCorrectedCards(updated);
    } else {
      // 添加新卡牌
      setCorrectedCards([...correctedCards, newCard].sort((a, b) => a.position - b.position));
    }
  };

  // 打开卡牌编辑器
  const handleEditCard = (index: number) => {
    setEditingCardIndex(index);
    setShowCardEditor(true);
  };

  // 添加新卡牌
  const handleAddNewCard = () => {
    setEditingCardIndex(null);
    setShowCardEditor(true);
  };

  // 删除卡牌
  const handleDeleteCard = (index: number) => {
    if (confirm('确定要删除这张卡牌吗？')) {
      const updated = correctedCards.filter((_, i) => i !== index);
      setCorrectedCards(updated);
    }
  };

  // 保存卡牌编辑
  const handleSaveCard = (card: CorrectedCard) => {
    if (editingCardIndex !== null) {
      // 更新现有卡牌
      const updated = [...correctedCards];
      updated[editingCardIndex] = { ...card, edited: true };
      setCorrectedCards(updated);
    } else {
      // 添加新卡牌
      const newCard = { ...card, source: 'manual' as const, edited: true };
      setCorrectedCards([...correctedCards, newCard].sort((a, b) => a.position - b.position));
    }
    setShowCardEditor(false);
  };

  // 保存校对结果
  const handleSave = async () => {
    if (correctedCards.length === 0) {
      alert('请至少选择一张卡牌');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/vision/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: detail.filename,
          correctedLabel: {
            cards: correctedCards,
            totalCards: correctedCards.length,
          },
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '保存失败');
      }

      alert('✅ 校对结果已保存！');
      onSaveSuccess(data.nextImage);
    } catch (err) {
      alert(`❌ 保存失败：${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 获取差异高亮
  const getDifferenceHighlight = (position: number, source: 'first' | 'second') => {
    const diff = detail.differences.find(
      d =>
        d.position === position &&
        ((source === 'first' && d.first) || (source === 'second' && d.second))
    );

    if (!diff) return '';

    if (diff.severity === 'critical') return 'ring-2 ring-red-500';
    if (diff.severity === 'major') return 'ring-2 ring-amber-500';
    return 'ring-2 ring-yellow-400';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      {/* 图片显示 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{detail.filename}</h3>
        {detail.imagePath && (
          <div className="relative w-full max-w-2xl mx-auto bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={`/api/vision/image?filename=${encodeURIComponent(detail.filename)}`}
              alt={detail.filename}
              className="w-full h-auto object-contain max-h-[600px]"
            />
          </div>
        )}
      </div>

      {/* 双重识别结果对比 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 第一次识别 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">第一次识别</h4>
          <div className="space-y-2">
            {detail.firstAnnotation.cards.map((card, idx) => (
              <div
                key={idx}
                className={`border rounded p-2 cursor-pointer hover:bg-blue-50 transition ${getDifferenceHighlight(
                  card.position,
                  'first'
                )}`}
                onClick={() => handleAddCardFromAnnotation(card, 'first')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {card.position}. {card.cardNameCn || '未识别'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {card.orientation === 'upright'
                        ? '正位'
                        : card.orientation === 'reversed'
                        ? '逆位'
                        : '未知'}
                      {' • '}
                      {card.confidence}
                    </div>
                  </div>
                  <button
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                    onClick={e => {
                      e.stopPropagation();
                      handleAddCardFromAnnotation(card, 'first');
                    }}
                  >
                    选择
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 第二次识别 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">第二次识别</h4>
          <div className="space-y-2">
            {detail.secondAnnotation.cards.map((card, idx) => (
              <div
                key={idx}
                className={`border rounded p-2 cursor-pointer hover:bg-green-50 transition ${getDifferenceHighlight(
                  card.position,
                  'second'
                )}`}
                onClick={() => handleAddCardFromAnnotation(card, 'second')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {card.position}. {card.cardNameCn || '未识别'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {card.orientation === 'upright'
                        ? '正位'
                        : card.orientation === 'reversed'
                        ? '逆位'
                        : '未知'}
                      {' • '}
                      {card.confidence}
                    </div>
                  </div>
                  <button
                    className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded"
                    onClick={e => {
                      e.stopPropagation();
                      handleAddCardFromAnnotation(card, 'second');
                    }}
                  >
                    选择
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 最终校对结果 */}
      <div className="border-2 border-indigo-200 rounded-lg p-4 mb-6 bg-indigo-50">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">最终校对结果 ({correctedCards.length} 张)</h4>
          <button
            onClick={handleAddNewCard}
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
          >
            + 添加卡牌
          </button>
        </div>
        <div className="space-y-2">
          {correctedCards.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              点击上方卡牌选择识别结果，或添加新卡牌
            </div>
          ) : (
            correctedCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white border rounded p-3 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {card.position}. {card.cardNameCn}
                  </div>
                  <div className="text-xs text-gray-600">
                    {card.orientation === 'upright' ? '正位' : '逆位'}
                    {' • '}
                    来源: {card.source === 'first' ? '第一次' : card.source === 'second' ? '第二次' : '手动添加'}
                    {card.edited && ' • 已编辑'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCard(idx)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteCard(idx)}
                    className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 备注 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">备注（可选）</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm"
          rows={3}
          placeholder="添加校对备注..."
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving || correctedCards.length === 0}
          className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   text-white font-medium transition-colors"
        >
          {isSaving ? '保存中...' : '确认标注'}
        </button>
      </div>

      {/* 卡牌编辑器弹窗 */}
      {showCardEditor && (
        <CardEditor
          card={editingCardIndex !== null ? correctedCards[editingCardIndex] : null}
          onSave={handleSaveCard}
          onCancel={() => setShowCardEditor(false)}
        />
      )}
    </div>
  );
}
