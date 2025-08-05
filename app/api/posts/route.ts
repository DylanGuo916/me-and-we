import { prisma } from '../../../lib/prisma';
import { auth } from '../../../lib/auth';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        community: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    return Response.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch posts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

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

    // 解析请求体
    const body = await request.json();
    const { title, content, originalAuthor, originalLink, communityId, tags } = body;

    // 验证输入数据
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return new Response(JSON.stringify({ error: '文章标题不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (title.trim().length > 100) {
      return new Response(JSON.stringify({ error: '文章标题不能超过100个字符' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return new Response(JSON.stringify({ error: '文章内容不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (content.trim().length > 10000) {
      return new Response(JSON.stringify({ error: '文章内容不能超过10000个字符' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!originalAuthor || typeof originalAuthor !== 'string' || originalAuthor.trim().length === 0) {
      return new Response(JSON.stringify({ error: '原作者不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (originalAuthor.trim().length > 100) {
      return new Response(JSON.stringify({ error: '原作者不能超过100个字符' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!originalLink || typeof originalLink !== 'string' || originalLink.trim().length === 0) {
      return new Response(JSON.stringify({ error: '原文链接不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 验证URL格式
    try {
      new URL(originalLink.trim());
    } catch {
      return new Response(JSON.stringify({ error: '原文链接格式不正确' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!communityId || typeof communityId !== 'string') {
      return new Response(JSON.stringify({ error: '请选择社区' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 验证社区是否存在
    const community = await prisma.community.findUnique({
      where: {
        id: communityId,
      },
    });

    if (!community) {
      return new Response(JSON.stringify({ error: '社区不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 验证用户是否有权限在该社区发布文章
    // 检查用户是否是社区成员或所有者
    const userCommunity = await prisma.userCommunity.findFirst({
      where: {
        userId: session.user.id,
        communityId: communityId,
      },
    });

    const isOwner = community.ownerId === session.user.id;

    if (!userCommunity && !isOwner) {
      return new Response(JSON.stringify({ error: '您不是该社区的成员，无法发布文章' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 生成slug（基于标题）
    const generateSlug = (title: string) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    };

    const baseSlug = generateSlug(title.trim());
    let slug = baseSlug;
    let counter = 1;

    // 检查slug是否已存在，如果存在则添加数字后缀
    while (true) {
      const existingPost = await prisma.post.findUnique({
        where: { slug },
      });
      if (!existingPost) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 创建文章
    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        originalAuthor: originalAuthor.trim(),
        originalLink: originalLink.trim(),
        slug: slug,
        authorId: session.user.id,
        communityId: communityId,
      },
      include: {
        author: true,
        community: true,
      },
    });

    // 如果有标签，可以在这里处理标签逻辑
    // 注意：当前Prisma schema中没有标签表，如果需要可以后续添加
    if (tags && Array.isArray(tags) && tags.length > 0) {
      console.log('Tags to be processed:', tags);
      // TODO: 实现标签功能
    }

    return Response.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return new Response(JSON.stringify({ error: 'Failed to create post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 