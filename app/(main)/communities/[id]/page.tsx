import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layouts/app-layout";
import { JoinCommunityButton } from "@/components/join-community-button";
import { VoteButtons } from "@/components/vote-buttons";
import Image from "next/image";
import { MessageCircle, Users, Calendar, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

interface CommunityMember {
  id: string;
  name: string;
  avatar?: string | null;
  joinedAt: Date;
}

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  score: number;
  comments: number;
  author: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

interface Community {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  owner: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  memberCount: number;
  postCount: number;
  recentMembers: CommunityMember[];
  recentPosts: CommunityPost[];
  userMembership: {
    isMember: boolean;
    isOwner: boolean;
    joinedAt?: Date | null;
  };
}

async function fetchCommunity(id: string): Promise<Community | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    const response = await fetch(`${baseUrl}/api/communities/${id}`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching community:", error);
    return null;
  }
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

interface CommunityPageProps {
  params: {
    id: string;
  };
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { id } = params;

  const community = await fetchCommunity(id);

  if (!community) {
    notFound();
  }

  return (
    <AppLayout showRightSidebar={true}>
      <div className="p-6">
        {/* Back Button */}
        {/* <div className="mb-6">
          <Link href="/communities">
            <Button variant="ghost" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Communities</span>
            </Button>
          </Link>
        </div> */}

        {/* Community Info Card */}
        <Card className="bg-white relative mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">
                      {community.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {community.name}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{community.memberCount} members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{community.postCount} posts</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Created {formatDate(new Date(community.createdAt))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {community.description && (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {community.description}
                  </p>
                )}

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Image
                    src={community.owner.avatar || "/placeholder-user.jpg"}
                    alt={`${community.owner.name} avatar`}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span>Admin:</span>
                  <span className="font-medium text-gray-700">
                    {community.owner.name}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <JoinCommunityButton
                  communityId={community.id}
                  communityName={community.name}
                />
                {/* <Link href="/submit">
                  <Button className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Create Post</span>
                  </Button>
                </Link> */}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Posts */}
          <div className="lg:col-span-2">
            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Recent Posts
                </h2>
                {community.recentPosts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No posts yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {community.recentPosts.map((post) => (
                      <div
                        key={post.id}
                        className="border-b border-gray-100 pb-4 last:border-b-0"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/posts/${post.id}`}
                              className="block hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                              <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                                {post.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {post.content}
                              </p>
                            </Link>
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Image
                                    src={
                                      post.author.avatar ||
                                      "/placeholder-user.jpg"
                                    }
                                    alt={`${post.author.name} avatar`}
                                    width={16}
                                    height={16}
                                    className="rounded-full"
                                  />
                                  <span>{post.author.name}</span>
                                </div>
                                <span>
                                  {formatDate(new Date(post.createdAt))}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <VoteButtons
                                  postId={post.id}
                                  initialScore={post.score}
                                  initialUserVote={null}
                                />
                                <div className="flex items-center space-x-1">
                                  <MessageCircle className="w-3 h-3" />
                                  <span>{post.comments}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Members */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Members
                </h3>
                {community.recentMembers.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No members yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {community.recentMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-3"
                      >
                        <Image
                          src={member.avatar || "/placeholder-user.jpg"}
                          alt={`${member.name} avatar`}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Joined {formatDate(new Date(member.joinedAt))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Community Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Members</span>
                    <span className="font-medium">{community.memberCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Posts</span>
                    <span className="font-medium">{community.postCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="font-medium">
                      {formatDate(new Date(community.createdAt))}
                    </span>
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
