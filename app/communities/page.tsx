import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import React from "react";

interface Community {
  id: string;
  name: string;
  description?: string | null;
  owner: {
    id: string;
    name: string;
  };
  members: { id: string }[];
  posts: { id: string }[];
}

async function fetchCommunities(): Promise<Community[]> {
  // 兼容本地和部署环境
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const res = await fetch(`${baseUrl}/api/communities`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function CommunitiesPage() {
  const communities = await fetchCommunities();
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Communities</h1>
      <div className="space-y-6">
        {communities.length === 0 ? (
          <div className="text-gray-500 text-center">No communities found.</div>
        ) : (
          communities.map((c) => (
            <Card key={c.id} className="bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col gap-2">
                  <Link href={`#`} className="text-lg font-semibold text-green-600 hover:underline">
                    {c.name}
                  </Link>
                  <div className="text-gray-600 text-sm">{c.description || "No description."}</div>
                  <div className="text-xs text-gray-400">
                    {c.members.length} subscribers • {c.posts.length} posts
                  </div>
                  <div className="text-xs text-gray-400">
                    admin: <span className="text-green-600">{c.owner.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 