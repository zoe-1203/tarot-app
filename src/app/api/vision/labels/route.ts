import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LABELS_DIR = path.join(process.cwd(), '../test/labels');
const TEST_DATA_DIR = path.join(process.cwd(), '../test/拍照占卜测试数据');

interface LabelSummary {
  filename: string;
  status: string;
  hasDifference: boolean;
  timestamp: string;
  totalCards: number;
}

interface LabelsListResponse {
  totalImages: number;
  annotatedImages: number;
  verifiedImages: number;
  conflictImages: number;
  labels: LabelSummary[];
}

// GET: 获取标注列表和统计
export async function GET() {
  try {
    if (!fs.existsSync(LABELS_DIR)) {
      return NextResponse.json({
        totalImages: 0,
        annotatedImages: 0,
        verifiedImages: 0,
        conflictImages: 0,
        labels: [],
      });
    }

    const files = fs.readdirSync(LABELS_DIR).filter((f) => f.endsWith('.json'));
    const labels: LabelSummary[] = [];

    let verifiedCount = 0;
    let conflictCount = 0;

    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(LABELS_DIR, file), 'utf-8'));
        labels.push({
          filename: data.filename,
          status: data.status || 'annotated',
          hasDifference: data.hasDifference || false,
          timestamp: data.timestamp,
          totalCards: data.finalLabel?.totalCards || 0,
        });

        if (data.status === 'verified') verifiedCount++;
        if (data.hasDifference) conflictCount++;
      } catch (error) {
        console.error(`Failed to parse ${file}:`, error);
      }
    }

    // 获取总图片数
    const allImages = fs.existsSync(TEST_DATA_DIR)
      ? fs.readdirSync(TEST_DATA_DIR).filter((f) => /\.(jpg|jpeg)$/i.test(f)).length
      : 0;

    const response: LabelsListResponse = {
      totalImages: allImages,
      annotatedImages: labels.length,
      verifiedImages: verifiedCount,
      conflictImages: conflictCount,
      labels: labels.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get labels list error:', error);
    return NextResponse.json(
      {
        error: '获取标注列表失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST: 生成汇总 labels.json
export async function POST() {
  try {
    if (!fs.existsSync(LABELS_DIR)) {
      return NextResponse.json({ error: '标注目录不存在' }, { status: 404 });
    }

    const files = fs.readdirSync(LABELS_DIR).filter((f) => f.endsWith('.json'));

    const images: any[] = [];
    let conflictCount = 0;

    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(LABELS_DIR, file), 'utf-8'));
        images.push({
          filename: data.filename,
          totalCards: data.finalLabel?.totalCards || 0,
          cards: data.finalLabel?.cards || [],
          hasDifference: data.hasDifference || false,
          status: data.status || 'annotated',
          source: data.finalLabel?.source || 'first',
        });

        if (data.hasDifference) conflictCount++;
      } catch (error) {
        console.error(`Failed to parse ${file}:`, error);
      }
    }

    const labelsFile = {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      totalImages: images.length,
      annotatedImages: images.length,
      verifiedImages: images.filter((i) => i.status === 'verified').length,
      conflictImages: conflictCount,
      images,
    };

    // 写入汇总文件
    const labelsFilePath = path.join(TEST_DATA_DIR, 'labels.json');
    fs.writeFileSync(labelsFilePath, JSON.stringify(labelsFile, null, 2), 'utf-8');

    return NextResponse.json({
      message: 'labels.json 已生成',
      path: labelsFilePath,
      totalImages: images.length,
      conflictImages: conflictCount,
    });
  } catch (error) {
    console.error('Generate labels.json error:', error);
    return NextResponse.json(
      {
        error: '生成 labels.json 失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
