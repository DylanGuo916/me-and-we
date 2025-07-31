import { prisma } from '../../../lib/prisma';
import { auth } from '../../../lib/auth';

export async function GET() {
  try {
    const communities = await prisma.community.findMany({
      include: {
        owner: true,
        members: true,
        posts: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });
    return Response.json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch communities' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
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
    const { name, description } = body;

    // 验证输入数据
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(JSON.stringify({ error: '社区名称不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (name.trim().length > 50) {
      return new Response(JSON.stringify({ error: '社区名称不能超过50个字符' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return new Response(JSON.stringify({ error: '社区描述不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (description.trim().length > 500) {
      return new Response(JSON.stringify({ error: '社区描述不能超过500个字符' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 检查社区名称是否已存在
    const existingCommunity = await prisma.community.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive', // 不区分大小写
        },
      },
    });

    if (existingCommunity) {
      return new Response(JSON.stringify({ error: '社区名称已存在' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 创建社区
    const community = await prisma.community.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        ownerId: session.user.id,
      },
      include: {
        owner: true,
        members: true,
        posts: true,
      },
    });

    // 创建者自动成为社区成员
    await prisma.userCommunity.create({
      data: {
        userId: session.user.id,
        communityId: community.id,
      },
    });

    return Response.json(community, { status: 201 });
  } catch (error) {
    console.error('Error creating community:', error);
    return new Response(JSON.stringify({ error: 'Failed to create community' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 