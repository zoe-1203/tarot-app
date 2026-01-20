'use client';

import { useState, useEffect } from 'react';
import { ReviewListResponse, ReviewDetailResponse, ReviewImage } from '@/lib/review-types';
import { ImageListSidebar } from './ImageListSidebar';
import { ReviewEditor } from './ReviewEditor';

export function ManualReviewPanel() {
  const [listData, setListData] = useState<ReviewListResponse | null>(null);
  const [currentImage, setCurrentImage] = useState<ReviewImage | null>(null);
  const [detailData, setDetailData] = useState<ReviewDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载图片列表
  const fetchList = async () => {
    try {
      const res = await fetch('/api/vision/review');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '加载失败');
      }

      setListData(data);

      // 自动选中第一张未校对的图片
      if (!currentImage && data.images.length > 0) {
        const firstPending = data.images.find((img: ReviewImage) => img.status === 'pending');
        if (firstPending) {
          setCurrentImage(firstPending);
        } else {
          setCurrentImage(data.images[0]);
        }
      }
    } catch (err) {
      console.error('加载图片列表失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
    }
  };

  // 加载图片详情
  const fetchDetail = async (image: ReviewImage) => {
    setLoading(true);
    setError(null);

    try {
      const filename = image.filename.replace('.JPG', '.json').replace('.jpg', '.json');
      const res = await fetch(`/api/vision/review/${encodeURIComponent(filename)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '加载详情失败');
      }

      setDetailData(data);
    } catch (err) {
      console.error('加载图片详情失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchList();
  }, []);

  // 当选中的图片变化时加载详情
  useEffect(() => {
    if (currentImage) {
      fetchDetail(currentImage);
    }
  }, [currentImage]);

  // 处理图片选择
  const handleSelectImage = (image: ReviewImage) => {
    setCurrentImage(image);
  };

  // 处理保存成功
  const handleSaveSuccess = (nextImage?: ReviewImage) => {
    // 刷新列表
    fetchList();

    // 如果有下一张图片，自动跳转
    if (nextImage) {
      setCurrentImage(nextImage);
    }
  };

  if (!listData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (listData.totalImages === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">暂无标注数据</div>
          <div className="text-sm">请先在"批量标注"页面完成图片标注</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* 左侧列表 */}
      <ImageListSidebar
        images={listData.images}
        currentImage={currentImage}
        totalImages={listData.totalImages}
        reviewedImages={listData.reviewedImages}
        pendingImages={listData.pendingImages}
        onSelectImage={handleSelectImage}
      />

      {/* 右侧编辑器 */}
      <div className="flex-1 overflow-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="text-red-800 font-medium">❌ 加载失败</div>
            <div className="text-red-700 text-sm mt-1">{error}</div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">加载详情中...</div>
          </div>
        ) : detailData && currentImage ? (
          <ReviewEditor
            detail={detailData}
            currentImage={currentImage}
            onSaveSuccess={handleSaveSuccess}
          />
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">请从左侧选择图片</div>
          </div>
        )}
      </div>
    </div>
  );
}
