import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ReviewListResponse, ReviewImage } from '@/lib/review-types';

// GET: 获取待校对图片列表
export async function GET() {
  try {
    const TEST_DIR = path.join(process.cwd(), '..', 'test');
    const LABELS_DIR = path.join(TEST_DIR, 'labels');
    const CORRECT_LABELS_DIR = path.join(TEST_DIR, 'correct_labels');

    // 确保目录存在
    if (!fs.existsSync(LABELS_DIR)) {
      return NextResponse.json(
        { error: 'labels 目录不存在' },
        { status: 404 }
      );
    }

    // 读取所有标注文件
    const labelFiles = fs
      .readdirSync(LABELS_DIR)
      .filter(file => file.endsWith('.json'))
      .sort();

    // 检查 correct_labels 目录
    const correctedFiles = new Set<string>();
    if (fs.existsSync(CORRECT_LABELS_DIR)) {
      fs.readdirSync(CORRECT_LABELS_DIR)
        .filter(file => file.endsWith('.json'))
        .forEach(file => correctedFiles.add(file));
    }

    // 构建图片列表
    const images: ReviewImage[] = [];
    let reviewedCount = 0;

    for (const labelFile of labelFiles) {
      const labelPath = path.join(LABELS_DIR, labelFile);
      const labelData = JSON.parse(fs.readFileSync(labelPath, 'utf-8'));

      const isCorrected = correctedFiles.has(labelFile);
      if (isCorrected) reviewedCount++;

      const image: ReviewImage = {
        filename: labelData.filename || labelFile.replace('.json', '.JPG'),
        status: isCorrected ? 'reviewed' : 'pending',
        hasDifference: labelData.hasDifference || false,
        differenceCount: labelData.differences?.length || 0,
        timestamp: labelData.timestamp || '',
        totalCards: labelData.finalLabel?.totalCards || labelData.firstAnnotation?.totalCards || 0,
      };

      images.push(image);
    }

    const response: ReviewListResponse = {
      totalImages: images.length,
      reviewedImages: reviewedCount,
      pendingImages: images.length - reviewedCount,
      images,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('获取校对列表失败:', error);
    return NextResponse.json(
      {
        error: '获取校对列表失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
