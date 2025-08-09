import { auth } from '../../../../lib/auth';
import { put } from "@vercel/blob";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 验证用户是否已登录
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 从查询参数获取文件名
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // 检查请求体是否存在
    if (!request.body) {
      return NextResponse.json({ error: 'No file content provided' }, { status: 400 });
    }

    // 验证文件类型
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = filename.toLowerCase().split('.').pop();
    if (!fileExtension || !allowedExtensions.includes(`.${fileExtension}`)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' 
      }, { status: 400 });
    }

    // 生成唯一的文件名
    const uniqueFilename = `images/${session.user.id}-${Date.now()}.${fileExtension}`;

    // 直接上传文件到Vercel Blob
    const blob = await put(uniqueFilename, request.body, {
      access: 'public',
    });

    return NextResponse.json({ 
      url: blob.url,
      message: 'Image uploaded successfully' 
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 可选：添加文件大小限制
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // 限制为10MB
    },
  },
};
