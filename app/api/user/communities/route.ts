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

    // 获取用户加入的社区（作为成员）
    const userCommunities = await prisma.userCommunity.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        community: {
          include: {
            owner: true,
            members: true,
            posts: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    // 获取用户拥有的社区（作为所有者）
    const ownedCommunities = await prisma.community.findMany({
      where: {
        ownerId: session.user.id,
      },
      include: {
        owner: true,
        members: true,
        posts: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 格式化返回数据
    const userCommunitiesData = userCommunities.map(uc => ({
      id: uc.community.id,
      name: uc.community.name,
      description: uc.community.description,
      role: 'Member',
      joinedAt: uc.joinedAt,
      owner: uc.community.owner,
      memberCount: uc.community.members.length,
      postCount: uc.community.posts.length,
      isOwner: false,
    }));

    const ownedCommunitiesData = ownedCommunities.map(community => ({
      id: community.id,
      name: community.name,
      description: community.description,
      role: 'Owner',
      joinedAt: community.createdAt, // 创建时间作为加入时间
      owner: community.owner,
      memberCount: community.members.length,
      postCount: community.posts.length,
      isOwner: true,
    }));

    // 合并所有社区，去重（因为用户拥有的社区可能也在成员列表中）
    const allCommunities = [...userCommunitiesData, ...ownedCommunitiesData];
    const uniqueCommunities = allCommunities.filter((community, index, self) => 
      index === self.findIndex(c => c.id === community.id)
    );

    // 按角色排序：所有者在前，成员在后
    const sortedCommunities = uniqueCommunities.sort((a, b) => {
      if (a.isOwner && !b.isOwner) return -1;
      if (!a.isOwner && b.isOwner) return 1;
      return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
    });

    return Response.json({
      communities: sortedCommunities,
      stats: {
        totalCommunities: sortedCommunities.length,
        ownedCommunities: ownedCommunities.length,
        memberCommunities: userCommunities.length,
      },
    });
  } catch (error) {
    console.error('Error fetching user communities:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch user communities' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 