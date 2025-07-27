import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { AppLayout } from "@/components/layouts/app-layout";

// 定义帖子类型
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

async function fetchPosts(): Promise<Post[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const url = apiUrl ? `${apiUrl}/api/posts` : '/api/posts';
    console.log('Fetching posts from:', url);
    const response = await fetch(url);
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
            posts.map((post) => (
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
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 text-sm mb-4">
                        {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <span className="text-green-600 font-medium">$0.00</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>0</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>💬</span>
                          <span>0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
