import { prisma } from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: communityId } = params;

    if (!communityId) {
      return new Response(
        JSON.stringify({ error: "Community ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 获取社区详细信息
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            joinedAt: "desc",
          },
          take: 10, // 只返回最近加入的10个成员
        },
        posts: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 20, // 只返回最近20篇文章
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    if (!community) {
      return new Response(JSON.stringify({ error: "Community not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 检查当前用户是否已登录
    const session = await auth.api.getSession({ headers: request.headers });
    let userMembership = null;
    let isOwner = false;

    if (session?.user?.id) {
      // 检查用户是否是社区成员
      userMembership = await prisma.userCommunity.findUnique({
        where: {
          userId_communityId: {
            userId: session.user.id,
            communityId: communityId,
          },
        },
      });

      // 检查用户是否是社区所有者
      isOwner = community.ownerId === session.user.id;
    }

    // 格式化返回数据
    const communityData = {
      id: community.id,
      name: community.name,
      description: community.description,
      createdAt: community.createdAt,
      owner: community.owner,
      memberCount: community._count.members,
      postCount: community._count.posts,
      recentMembers: community.members.map((member: any) => ({
        id: member.user.id,
        name: member.user.name,
        avatar: member.user.avatar,
        joinedAt: member.joinedAt,
      })),
      recentPosts: community.posts.map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        score: post.score,
        author: post.author,
        // 生成随机评论数（暂时）
        comments: Math.floor(Math.random() * 20) + 1,
      })),
      userMembership: {
        isMember: !!userMembership,
        isOwner: isOwner,
        joinedAt: userMembership?.joinedAt || null,
      },
    };

    return Response.json(communityData);
  } catch (error) {
    console.error("Error fetching community:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch community" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
