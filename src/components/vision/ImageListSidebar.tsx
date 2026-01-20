'use client';

import { useState } from 'react';
import { ReviewImage } from '@/lib/review-types';

interface ImageListSidebarProps {
  images: ReviewImage[];
  currentImage: ReviewImage | null;
  totalImages: number;
  reviewedImages: number;
  pendingImages: number;
  onSelectImage: (image: ReviewImage) => void;
}

type FilterType = 'all' | 'pending' | 'reviewed' | 'difference';

export function ImageListSidebar({
  images,
  currentImage,
  totalImages,
  reviewedImages,
  pendingImages,
  onSelectImage,
}: ImageListSidebarProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  // 筛选图片
  const filteredImages = images.filter(image => {
    if (filter === 'all') return true;
    if (filter === 'pending') return image.status === 'pending';
    if (filter === 'reviewed') return image.status === 'reviewed';
    if (filter === 'difference') return image.hasDifference;
    return true;
  });

  // 获取状态颜色
  const getStatusColor = (image: ReviewImage) => {
    if (image.status === 'reviewed') return 'bg-green-100 border-green-300';
    if (image.hasDifference) return 'bg-amber-100 border-amber-300';
    return 'bg-gray-100 border-gray-300';
  };

  // 获取状态图标
  const getStatusIcon = (image: ReviewImage) => {
    if (image.status === 'reviewed') return '✓';
    if (image.hasDifference) return '⚠';
    return '';
  };

  const differenceCount = images.filter(img => img.hasDifference).length;

  return (
    <div className="w-80 bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col h-full">
      {/* 统计信息 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">图片列表</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-blue-50 rounded p-2">
            <div className="text-blue-600 text-xs">总数</div>
            <div className="text-blue-900 font-bold">{totalImages}</div>
          </div>
          <div className="bg-green-50 rounded p-2">
            <div className="text-green-600 text-xs">已校对</div>
            <div className="text-green-900 font-bold">{reviewedImages}</div>
          </div>
          <div className="bg-amber-50 rounded p-2">
            <div className="text-amber-600 text-xs">待校对</div>
            <div className="text-amber-900 font-bold">{pendingImages}</div>
          </div>
          <div className="bg-red-50 rounded p-2">
            <div className="text-red-600 text-xs">有差异</div>
            <div className="text-red-900 font-bold">{differenceCount}</div>
          </div>
        </div>
      </div>

      {/* 筛选按钮 */}
      <div className="flex gap-2 mb-3 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-1 rounded ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-2 py-1 rounded ${
            filter === 'pending'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          未校对
        </button>
        <button
          onClick={() => setFilter('reviewed')}
          className={`px-2 py-1 rounded ${
            filter === 'reviewed'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          已校对
        </button>
        <button
          onClick={() => setFilter('difference')}
          className={`px-2 py-1 rounded ${
            filter === 'difference'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          有差异
        </button>
      </div>

      {/* 图片列表 */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredImages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            {filter === 'all' ? '暂无图片' : `无${filter === 'pending' ? '未校对' : filter === 'reviewed' ? '已校对' : '有差异的'}图片`}
          </div>
        ) : (
          filteredImages.map(image => (
            <div
              key={image.filename}
              onClick={() => onSelectImage(image)}
              className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                getStatusColor(image)
              } ${
                currentImage?.filename === image.filename
                  ? 'ring-2 ring-indigo-600 ring-offset-2'
                  : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="font-medium text-sm text-gray-900 truncate flex-1">
                  {image.filename}
                </div>
                {getStatusIcon(image) && (
                  <div className="ml-2 text-lg">{getStatusIcon(image)}</div>
                )}
              </div>
              <div className="text-xs text-gray-600 space-y-0.5">
                <div>{image.totalCards || 0} 张卡牌</div>
                {image.hasDifference && (
                  <div className="text-amber-700">{image.differenceCount} 处差异</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
