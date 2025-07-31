import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/layouts/app-layout";
import Image from "next/image";
import { MessageCircle, Share2, ArrowUp, ArrowDown, Gift } from "lucide-react";
import Link from "next/link";

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
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

// 生成随机数的辅助函数
function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function fetchPosts(): Promise<Post[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const response = await fetch(`${baseUrl}/api/posts`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function HomePage() {
  const posts = await fetchPosts();
  
  // 格式化日期的辅助函数
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <AppLayout showRightSidebar={true}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">All posts</h1>
          <Select defaultValue="trending">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No posts found.
            </div>
          ) : (
            posts.map((post) => {
              // 为每个帖子生成随机的点赞和点踩数
              const upvotes = generateRandomNumber(1, 50);
              const downvotes = generateRandomNumber(1, 20);
              const comments = generateRandomNumber(0, 30);
              
              return (
                <Card key={post.id} className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Image
                        src={post.author.avatar || "/placeholder-user.jpg"}
                        alt={`${post.author.name} avatar`}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                          <span className="font-medium text-gray-700">{post.author.name}</span>
                          <span>in</span>
                          <span className="text-blue-500">#{post.community?.name || 'general'}</span>
                          <span>•</span>
                          <span>{formatDate(new Date(post.createdAt))}</span>
                        </div>
                        <Link href={`/posts/${post.id}`}>
                          <h2 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer transition-colors">
                            {post.title}
                          </h2>
                        </Link>
                        <p className="text-gray-600 text-sm mb-4">
                          {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                        </p>
                        
                        {/* 交互功能按钮 */}
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          {/* 点赞/踩功能 */}
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                            <span className="font-medium text-gray-700">{upvotes}</span>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                              <ArrowDown className="w-4 h-4" />
                            </Button>
                            <span className="font-medium text-gray-700">{downvotes}</span>
                          </div>
                          
                          {/* 评论功能 */}
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-gray-100">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              <span>{comments}</span>
                            </Button>
                          </div>
                          
                          {/* 打赏/奖励功能 */}
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-gray-100">
                              <Gift className="w-4 h-4 mr-1" />
                              <span>奖励</span>
                            </Button>
                          </div>
                          
                          {/* 转发/分享功能 */}
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-gray-100">
                              <Share2 className="w-4 h-4 mr-1" />
                              <span>共享</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
