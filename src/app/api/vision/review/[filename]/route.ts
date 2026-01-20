import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ReviewDetailResponse, CorrectedLabel } from '@/lib/review-types';

// GET: 获取单个图片的标注详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    const TEST_DIR = path.join(process.cwd(), '..', 'test');
    const LABELS_DIR = path.join(TEST_DIR, 'labels');
    const CORRECT_LABELS_DIR = path.join(TEST_DIR, 'correct_labels');
    const IMAGES_DIR = path.join(TEST_DIR, '拍照占卜测试数据');

    // 构建文件路径
    const labelFile = filename.endsWith('.json') ? filename : `${filename}.json`;
    const labelPath = path.join(LABELS_DIR, labelFile);

    // 检查标注文件是否存在
    if (!fs.existsSync(labelPath)) {
      return NextResponse.json(
        { error: `标注文件不存在: ${labelFile}` },
        { status: 404 }
      );
    }

    // 读取标注数据
    const labelData = JSON.parse(fs.readFileSync(labelPath, 'utf-8'));

    // 查找对应的图片文件
    const imageFilename = labelData.filename || labelFile.replace('.json', '.JPG');
    const imagePath = path.join(IMAGES_DIR, imageFilename);

    // 检查是否有已校对的结果
    let existingCorrection: CorrectedLabel | undefined;
    const correctedPath = path.join(CORRECT_LABELS_DIR, labelFile);
    if (fs.existsSync(correctedPath)) {
      existingCorrection = JSON.parse(fs.readFileSync(correctedPath, 'utf-8'));
    }

    const response: ReviewDetailResponse = {
      filename: imageFilename,
      imagePath: fs.existsSync(imagePath) ? imageFilename : '',
      firstAnnotation: labelData.firstAnnotation,
      secondAnnotation: labelData.secondAnnotation,
      differences: labelData.differences || [],
      hasDifference: labelData.hasDifference || false,
      existingCorrection,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('获取标注详情失败:', error);
    return NextResponse.json(
      {
        error: '获取标注详情失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
