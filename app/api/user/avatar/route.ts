import { prisma } from '../../../../lib/prisma';
import { auth } from '../../../../lib/auth';
import { put, del } from "@vercel/blob";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 验证用户是否已登录
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 从查询参数获取文件名
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return new Response(JSON.stringify({ error: 'Filename is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 检查请求体是否存在
    if (!request.body) {
      return new Response(JSON.stringify({ error: 'No file content provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 验证文件类型
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = filename.toLowerCase().split('.').pop();
    if (!fileExtension || !allowedExtensions.includes(`.${fileExtension}`)) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 获取用户当前头像URL
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true, image: true },
    });

    // 生成唯一的文件名
    const uniqueFilename = `avatars/${session.user.id}-${Date.now()}.${fileExtension}`;

    // 直接上传文件到Vercel Blob
    const blob = await put(uniqueFilename, request.body, {
      access: 'public',
    });

    // 更新用户头像URL
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        avatar: blob.url,
        image: blob.url  // 同时更新image字段，这样better-auth的session就能正确显示头像
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        image: true,
      },
    });

    // 删除旧的头像文件（如果存在且是Vercel Blob URL）
    if (currentUser?.avatar && currentUser.avatar.includes('blob.vercel-storage.com')) {
      try {
        // 从URL中提取blob名称
        const urlParts = currentUser.avatar.split('/');
        const blobName = urlParts[urlParts.length - 1];
        if (blobName) {
          await del(blobName);
        }
      } catch (deleteError) {
        console.warn('Failed to delete old avatar:', deleteError);
        // 不阻止整个操作，只是记录警告
      }
    }

    // 如果image字段也有旧的头像URL，也尝试删除
    if (currentUser?.image && currentUser.image.includes('blob.vercel-storage.com') && currentUser.image !== currentUser.avatar) {
      try {
        const urlParts = currentUser.image.split('/');
        const blobName = urlParts[urlParts.length - 1];
        if (blobName) {
          await del(blobName);
        }
      } catch (deleteError) {
        console.warn('Failed to delete old image:', deleteError);
      }
    }

    return NextResponse.json({
      success: true,
      avatar: updatedUser.avatar,
      message: 'Avatar updated successfully'
    });

  } catch (error) {
    console.error('Error updating avatar:', error);
    return new Response(JSON.stringify({ error: 'Failed to update avatar' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 