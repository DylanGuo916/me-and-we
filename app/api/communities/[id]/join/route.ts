import { prisma } from '../../../../../lib/prisma';
import { auth } from '../../../../../lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户是否已登录
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id: communityId } = params;

    if (!communityId) {
      return new Response(JSON.stringify({ error: 'Community ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 检查社区是否存在
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!community) {
      return new Response(JSON.stringify({ error: 'Community not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 检查用户是否已经是社区成员
    const existingMembership = await prisma.userCommunity.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId: communityId,
        },
      },
    });

    if (existingMembership) {
      return new Response(JSON.stringify({ 
        error: 'Already a member of this community',
        isMember: true 
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 检查用户是否是社区所有者
    if (community.ownerId === session.user.id) {
      return new Response(JSON.stringify({ 
        error: 'You are the owner of this community',
        isOwner: true 
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 加入社区
    await prisma.userCommunity.create({
      data: {
        userId: session.user.id,
        communityId: communityId,
      },
    });

    return Response.json({
      success: true,
      message: 'Successfully joined the community',
      community: {
        id: community.id,
        name: community.name,
        memberCount: community._count.members + 1,
      },
    });

  } catch (error) {
    console.error('Error joining community:', error);
    return new Response(JSON.stringify({ error: 'Failed to join community' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户是否已登录
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id: communityId } = params;

    // 检查用户是否已经是社区成员
    const membership = await prisma.userCommunity.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId: communityId,
        },
      },
    });

    // 检查用户是否是社区所有者
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { ownerId: true },
    });

    const isOwner = community?.ownerId === session.user.id;

    return Response.json({
      isMember: !!membership,
      isOwner: isOwner,
    });

  } catch (error) {
    console.error('Error checking community membership:', error);
    return new Response(JSON.stringify({ error: 'Failed to check membership' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 