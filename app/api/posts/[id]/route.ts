import { prisma } from '../../../../lib/prisma';
import { auth } from '../../../../lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await auth.api.getSession({ headers: request.headers });

    if (!id) {
      return new Response(JSON.stringify({ error: 'Post ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: id,
      },
      include: {
        author: true,
        community: true,
        votes: session?.user?.id ? {
          where: { 
            userId: session.user.id,
            voteType: { not: "CANCELLED" } // 排除取消的投票
          },
        } : false,
      },
    });

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 添加用户投票状态
    const postWithVoteStatus = {
      ...post,
      userVote: post.votes?.[0]?.voteType || null,
    };

    return Response.json(postWithVoteStatus);
  } catch (error) {
    console.error('Error fetching post:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 