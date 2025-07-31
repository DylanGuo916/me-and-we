import { prisma } from '../../../../lib/prisma';
import { auth } from '../../../../lib/auth';

export async function GET(request: Request) {
  try {
    // 验证用户是否已登录
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 获取用户基本信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 获取用户最近的文章
    const recentPosts = await prisma.post.findMany({
      where: { authorId: session.user.id },
      include: {
        community: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 获取用户加入的社区
    const userCommunities = await prisma.userCommunity.findMany({
      where: { userId: session.user.id },
      include: {
        community: {
          include: {
            _count: {
              select: {
                members: true,
                posts: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    // 获取用户拥有的社区
    const ownedCommunities = await prisma.community.findMany({
      where: { ownerId: session.user.id },
      include: {
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 合并社区数据，去重并添加角色信息
    const allCommunities = [
      ...userCommunities.map(uc => ({
        id: uc.community.id,
        name: uc.community.name,
        description: uc.community.description,
        role: 'Member',
        memberCount: uc.community._count.members,
        postCount: uc.community._count.posts,
        joinedAt: uc.joinedAt,
      })),
      ...ownedCommunities.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        role: 'Owner',
        memberCount: c._count.members,
        postCount: c._count.posts,
        joinedAt: c.createdAt,
      })),
    ];

    // 去重（如果用户既是成员又是所有者，保留所有者角色）
    const uniqueCommunities = allCommunities.reduce((acc, community) => {
      const existing = acc.find(c => c.id === community.id);
      if (!existing) {
        acc.push(community);
      } else if (community.role === 'Owner' && existing.role === 'Member') {
        // 如果新的是Owner，替换Member
        const index = acc.findIndex(c => c.id === community.id);
        acc[index] = community;
      }
      return acc;
    }, [] as typeof allCommunities);

    // 计算统计数据
    const totalPosts = await prisma.post.count({
      where: { authorId: session.user.id },
    });

    const totalCommunities = uniqueCommunities.length;

    // 计算总收益（这里用随机数模拟，实际项目中应该有真实的收益系统）
    const totalEarned = recentPosts.reduce((sum, post) => {
      return sum + Math.floor(Math.random() * 10) + 1; // 1-10的随机数
    }, 0);

    const profile = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        username: user.email?.split('@')[0] || user.name?.toLowerCase().replace(/\s+/g, ''),
      },
      stats: {
        totalPosts,
        totalCommunities,
        totalEarned,
      },
      recentPosts: recentPosts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        community: post.community ? {
          id: post.community.id,
          name: post.community.name,
        } : null,
        // 模拟数据
        comments: Math.floor(Math.random() * 20) + 1,
        earned: Math.floor(Math.random() * 10) + 1,
      })),
      communities: uniqueCommunities.slice(0, 5), // 只返回前5个
    };

    return Response.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 