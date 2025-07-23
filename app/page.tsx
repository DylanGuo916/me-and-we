import { Search, Edit, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import UserMenu from "@/components/user-menu"

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
    // 使用环境变量或默认值确保URL正确构建
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

export default async function Component() {
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

  const cryptoData = [
    { name: "STEEM", price: "0.16", change: "+2.5%" },
    { name: "TRX", price: "0.31", change: "-1.2%" },
    { name: "JST", price: "0.038", change: "+0.8%" },
    { name: "BTC", price: "119199.29", change: "+3.4%" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-2xl font-light text-green-500">steemit</span>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Input placeholder="Search" className="pl-4 pr-10 py-2 w-full" />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <UserMenu />
            <Edit className="w-5 h-5 text-gray-600" />
            <Menu className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <nav className="space-y-2">
            <div className="flex items-center space-x-2 text-green-500 font-medium py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Explore</span>
            </div>
            <div className="pl-4 space-y-1">
              <a href="#" className="flex items-center space-x-2 text-gray-700 py-2 hover:text-green-500">
                <span>📄</span>
                <span>All Posts</span>
              </a>
              <a href="/communities" className="flex items-center space-x-2 text-gray-700 py-2 hover:text-green-500">
                <span>👥</span>
                <span>Communities</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-gray-700 py-2 hover:text-green-500">
                <span>👤</span>
                <span>My Profile</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-gray-700 py-2 hover:text-green-500">
                <span>💰</span>
                <span>My Wallet</span>
              </a>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
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
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 p-6 space-y-6">
          <Card className="bg-white">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">New to Steemit?</h3>
              <p className="text-sm text-blue-600 hover:underline cursor-pointer">Welcome Guide</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Coin Marketplace</h3>
              <div className="space-y-4">
                {cryptoData.map((crypto, index) => (
                  <div key={crypto.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{crypto.name}</span>
                      <span className="text-sm text-gray-600">{crypto.price}</span>
                    </div>
                    <div className="h-16 bg-gray-50 rounded flex items-center justify-center">
                      <svg width="200" height="40" className="text-green-500">
                        <polyline
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          points={`0,30 50,${20 + Math.random() * 20} 100,${15 + Math.random() * 20} 150,${10 + Math.random() * 20} 200,${5 + Math.random() * 20}`}
                        />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{crypto.name}</span>
                      <span className={`${crypto.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                        {crypto.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
