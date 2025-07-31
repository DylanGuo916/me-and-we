"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layouts/app-layout";
import { User, Settings, Bell, Shield, HelpCircle } from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

// 格式化日期的辅助函数
function formatDate(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  return `${diffDays} days ago`;
}

export default function ProfilePage() {
  const { profile, loading, error } = useUserProfile();

  if (loading) {
    return (
      <AppLayout showSidebar={false} showRightSidebar={false}>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout showSidebar={false} showRightSidebar={false}>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout showSidebar={false} showRightSidebar={false}>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <Alert>
              <AlertDescription>无法加载用户信息</AlertDescription>
            </Alert>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showSidebar={false} showRightSidebar={false}>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                  {profile.user.avatar ? (
                    <img 
                      src={profile.user.avatar} 
                      alt={`${profile.user.name} avatar`}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.user.name}</h1>
                  <p className="text-gray-600">@{profile.user.username}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Blockchain enthusiast and content creator. Building the
                    future of decentralized social media.
                  </p>
                  <div className="flex items-center space-x-4 mt-4">
                    <Button>Edit Profile</Button>
                    <Button variant="outline">Share Profile</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.recentPosts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      还没有发布任何文章
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {profile.recentPosts.map((post) => (
                        <div key={post.id} className="border-b border-gray-200 pb-4">
                          <Link href={`/posts/${post.id}`}>
                            <h3 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
                              {post.title}
                            </h3>
                          </Link>
                          <p className="text-gray-600 text-sm mt-1">
                            {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{formatDate(new Date(post.createdAt))}</span>
                            <span>•</span>
                            <span>{post.comments} comments</span>
                            <span>•</span>
                            <span>${post.earned.toFixed(2)} earned</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Side Content */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Communities</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.communities.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      还没有加入任何社区
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {profile.communities.map((community) => (
                        <div key={community.id} className="flex items-center justify-between">
                          <span className="text-sm">#{community.name}</span>
                          <span className="text-xs text-gray-500">{community.role}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Posts</span>
                      <span className="font-medium">{profile.stats.totalPosts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Communities</span>
                      <span className="font-medium">{profile.stats.totalCommunities}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Earned</span>
                      <span className="font-medium text-green-600">${profile.stats.totalEarned.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
