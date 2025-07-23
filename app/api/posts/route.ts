import { prisma } from '../../../lib/prisma';

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