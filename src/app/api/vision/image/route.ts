import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TEST_DATA_DIR = path.join(process.cwd(), '../test/拍照占卜测试数据');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Missing filename parameter' },
        { status: 400 }
      );
    }

    // 安全检查：防止目录遍历攻击
    const safeName = path.basename(filename);
    const filePath = path.join(TEST_DATA_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    const buffer = fs.readFileSync(filePath);
    const mimeType = safeName.toLowerCase().endsWith('.png')
      ? 'image/png'
      : 'image/jpeg';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Image API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
