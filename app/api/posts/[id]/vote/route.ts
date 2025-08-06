import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "未授权" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { voteType } = await request.json();
    const postId = params.id;
    const userId = session.user.id;

    // 验证投票类型
    if (!["UP", "DOWN"].includes(voteType)) {
      return new Response(JSON.stringify({ error: "无效的投票类型" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 检查文章是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return new Response(JSON.stringify({ error: "文章不存在" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 查找用户现有的投票
    const existingVote = await prisma.postVote.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    let scoreChange = 0;

    if (existingVote) {
      // 用户已经有投票记录
      if (existingVote.voteType === voteType) {
        // 用户点击了相同的投票类型，取消投票（标记为CANCELLED）
        await prisma.postVote.update({
          where: { id: existingVote.id },
          data: { voteType: "CANCELLED" },
        });
        scoreChange = voteType === "UP" ? -1 : 1;
      } else if (existingVote.voteType === "CANCELLED") {
        // 用户从取消状态重新投票
        await prisma.postVote.update({
          where: { id: existingVote.id },
          data: { voteType },
        });
        scoreChange = voteType === "UP" ? 1 : -1;
      } else {
        // 用户改变了投票类型
        await prisma.postVote.update({
          where: { id: existingVote.id },
          data: { voteType },
        });
        // 计算分数变化：从当前投票类型改为新投票类型
        if (existingVote.voteType === "UP" && voteType === "DOWN") {
          scoreChange = -2; // UP -> DOWN: -2
        } else if (existingVote.voteType === "DOWN" && voteType === "UP") {
          scoreChange = 2;  // DOWN -> UP: +2
        }
      }
    } else {
      // 用户第一次投票
      await prisma.postVote.create({
        data: {
          postId,
          userId,
          voteType,
        },
      });
      scoreChange = voteType === "UP" ? 1 : -1;
    }

    // 更新文章的分数
    await prisma.post.update({
      where: { id: postId },
      data: {
        score: {
          increment: scoreChange,
        },
      },
    });

    // 获取更新后的文章信息
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        votes: {
          where: { 
            userId,
            voteType: { not: "CANCELLED" } // 排除取消的投票
          },
        },
      },
    });

    return new Response(JSON.stringify({
      success: true,
      score: updatedPost?.score,
      userVote: updatedPost?.votes[0]?.voteType || null,
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("投票错误:", error);
    return new Response(JSON.stringify({ error: "投票失败" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const postId = params.id;

    // 获取文章信息和用户投票状态
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        votes: session?.user?.id ? {
          where: { 
            userId: session.user.id,
            voteType: { not: "CANCELLED" } // 排除取消的投票
          },
        } : false,
      },
    });

    if (!post) {
      return new Response(JSON.stringify({ error: "文章不存在" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      score: post.score,
      userVote: post.votes?.[0]?.voteType || null,
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("获取投票状态错误:", error);
    return new Response(JSON.stringify({ error: "获取投票状态失败" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 