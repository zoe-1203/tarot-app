import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  SaveCorrectionRequest,
  SaveCorrectionResponse,
  CorrectedLabel,
  ReviewImage,
} from '@/lib/review-types';

// POST: 保存人工校对结果
export async function POST(request: Request) {
  try {
    const body: SaveCorrectionRequest = await request.json();
    const { filename, correctedLabel, notes } = body;

    if (!filename || !correctedLabel) {
      return NextResponse.json(
        { error: '缺少必要参数: filename 或 correctedLabel' },
        { status: 400 }
      );
    }

    const TEST_DIR = path.join(process.cwd(), '..', 'test');
    const LABELS_DIR = path.join(TEST_DIR, 'labels');
    const CORRECT_LABELS_DIR = path.join(TEST_DIR, 'correct_labels');

    // 确保 correct_labels 目录存在
    if (!fs.existsSync(CORRECT_LABELS_DIR)) {
      fs.mkdirSync(CORRECT_LABELS_DIR, { recursive: true });
    }

    // 读取原始标注数据
    // 如果传入的是图片文件名（如 1767686999252.JPG），需要先移除图片扩展名
    let baseFilename = filename;
    if (filename.match(/\.(jpe?g|png|gif|webp)$/i)) {
      baseFilename = filename.replace(/\.(jpe?g|png|gif|webp)$/i, '');
    }
    const labelFile = baseFilename.endsWith('.json') ? baseFilename : `${baseFilename}.json`;
    const labelPath = path.join(process.cwd(), '..', 'test', 'labels', labelFile);

    if (!fs.existsSync(labelPath)) {
      return NextResponse.json(
        { error: `标注文件不存在: ${labelFile}` },
        { status: 404 }
      );
    }

    const labelData = JSON.parse(fs.readFileSync(labelPath, 'utf-8'));

    // 构建校对后的标注文件
    const correctedData: CorrectedLabel = {
      filename: body.filename,
      originalAnnotation: {
        firstAnnotation: labelData.firstAnnotation,
        secondAnnotation: labelData.secondAnnotation,
        hasDifference: labelData.hasDifference || false,
        differences: labelData.differences || [],
      },
      correctedLabel: {
        cards: body.correctedLabel.cards,
        totalCards: body.correctedLabel.totalCards,
      },
      reviewInfo: {
        reviewedBy: 'human',
        reviewedAt: new Date().toISOString(),
        status: 'verified',
        notes: body.notes || '',
      },
      version: '1.0',
    };

    // 确保 correct_labels 目录存在
    if (!fs.existsSync(CORRECT_LABELS_DIR)) {
      fs.mkdirSync(CORRECT_LABELS_DIR, { recursive: true });
    }

    // 保存校对结果
    const correctedFilename = labelFile;
    const correctedPath = path.join(CORRECT_LABELS_DIR, correctedFilename);
    fs.writeFileSync(correctedPath, JSON.stringify(correctedData, null, 2), 'utf-8');

    // 查找下一张待校对的图片
    const labelFiles = fs
      .readdirSync(LABELS_DIR)
      .filter(f => f.endsWith('.json'))
      .sort();

    const currentIndex = labelFiles.indexOf(labelFile);
    let nextImage: ReviewImage | undefined;

    // 查找下一张未校对的图片
    for (let i = currentIndex + 1; i < labelFiles.length; i++) {
      const nextFile = labelFiles[i];
      const correctedPath = path.join(CORRECT_LABELS_DIR, nextFile);

      if (!fs.existsSync(correctedPath)) {
        const nextLabelPath = path.join(LABELS_DIR, nextFile);
        const nextLabelData = JSON.parse(fs.readFileSync(nextLabelPath, 'utf-8'));

        nextImage = {
          filename: nextLabelData.filename || nextFile.replace('.json', '.JPG'),
          status: 'pending',
          hasDifference: nextLabelData.hasDifference || false,
          differenceCount: nextLabelData.differences?.length || 0,
          timestamp: nextLabelData.timestamp || '',
          totalCards: nextLabelData.finalLabel?.totalCards || 0,
        };
        break;
      }
    }

    const response: SaveCorrectionResponse = {
      success: true,
      message: '校对结果已保存',
      savedPath: correctedPath,
      nextImage,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('保存校对结果失败:', error);
    return NextResponse.json(
      {
        error: '保存校对结果失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
