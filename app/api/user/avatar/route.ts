import { prisma } from '../../../../lib/prisma';
import { auth } from '../../../../lib/auth';
import { put, del } from "@vercel/blob";

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

    // 解析FormData
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 验证文件大小 (限制为5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: 'File too large. Maximum size is 5MB.' }), {
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
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `avatars/${session.user.id}-${Date.now()}.${fileExtension}`;

    // 将文件转换为Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 上传到Vercel Blob
    const { url } = await put(fileName, buffer, { 
      access: 'public',
      contentType: file.type
    });

    // 更新用户头像URL
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        avatar: url,
        image: url  // 同时更新image字段，这样better-auth的session就能正确显示头像
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

    return Response.json({
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