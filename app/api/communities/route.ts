import { prisma } from '../../../lib/prisma';

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