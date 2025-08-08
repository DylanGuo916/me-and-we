import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layouts/app-layout";
import { JoinCommunityButton } from "@/components/join-community-button";
import { VoteButtons } from "@/components/vote-buttons";
import Image from "next/image";
import { MessageCircle, Gift, ArrowLeft } from "lucide-react";
import { SharePost } from "@/components/share-post";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  score: number;
  userVote?: "UP" | "DOWN" | null;
  originalAuthor?: string | null;
  originalLink?: string | null;
  author: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  community?: {
    id: string;
    name: string;
  } | null;
}

async function fetchPost(id: string): Promise<Post | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    const response = await fetch(`${baseUrl}/api/posts/${id}`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

// 生成随机数的辅助函数
function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 格式化日期的辅助函数
function formatDate(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  return `${diffDays} days ago`;
}

interface PostPageProps {
  params: {
    id: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = params;

  const post = await fetchPost(id);

  if (!post) {
    notFound();
  }

  // 生成随机评论数（暂时，后续可以添加真实的评论计数）
  const comments = generateRandomNumber(0, 30);

  return (
    <AppLayout showRightSidebar={true}>
      <div className="p-6">
        {/* 返回按钮 */}
        {/* <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>返回首页</span>
            </Button>
          </Link>
        </div> */}

        {/* 文章内容 */}
        <Card className="bg-white relative">
          {/* Join按钮 - 右上角 */}
          {post.community && (
            <div className="absolute top-4 right-4 z-10">
              <JoinCommunityButton
                communityId={post.community.id}
                communityName={post.community.name}
              />
            </div>
          )}

          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2 flex-wrap">
                  <Image
                    src={post.author.avatar || "/placeholder-user.jpg"}
                    alt={`${post.author.name} avatar`}
                    width={40}
                    height={40}
                    className="rounded-full flex-shrink-0"
                  />
                  <span className="font-medium text-gray-700">
                    {post.author.name}
                  </span>
                  <span>in</span>
                  <span className="text-blue-500">
                    #{post.community?.name || "general"}
                  </span>
                  <span>•</span>
                  <span>{formatDate(new Date(post.createdAt))}</span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4 break-words">
                  {post.title}
                </h1>

                {/* 原始作者和链接信息 */}
                {(post.originalAuthor || post.originalLink) && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <div className="text-sm text-gray-600">
                      {post.originalAuthor && (
                        <div className="mb-1">
                          <span className="font-medium">原始作者：</span>
                          <span>{post.originalAuthor}</span>
                        </div>
                      )}
                      {post.originalLink && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">原文链接：</span>
                          <a
                            href={post.originalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline break-all"
                          >
                            {post.originalLink}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                    {post.content}
                  </p>
                </div>

                {/* 交互功能按钮 */}
                <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4 flex-wrap gap-4">
                  <div className="flex items-center space-x-6 flex-wrap">
                    {/* 点赞/踩功能 */}
                    <VoteButtons
                      postId={post.id}
                      initialScore={post.score}
                      initialUserVote={post.userVote}
                    />

                    {/* 评论功能 */}
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 hover:bg-gray-100"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        <span>{comments}</span>
                      </Button>
                    </div>

                    {/* 打赏/奖励功能 */}
                    {/* <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-gray-100">
                        <Gift className="w-4 h-4 mr-1" />
                        <span>奖励</span>
                      </Button>
                    </div> */}

                    {/* 转发/分享功能 */}
                    <SharePost
                      postId={post.id}
                      title={post.title}
                      content={post.content}
                      authorName={post.author.name}
                      communityName={post.community?.name}
                    />
                  </div>

                  {/* Join按钮 - 最右侧 */}
                  {post.community && (
                    <div className="flex items-center">
                      <JoinCommunityButton
                        communityId={post.community.id}
                        communityName={post.community.name}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 评论区占位 */}
        <Card className="mt-6 bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">评论</h3>
            <div className="text-center py-8 text-gray-500">
              评论功能即将推出...
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
