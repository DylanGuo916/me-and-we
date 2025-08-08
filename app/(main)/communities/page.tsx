import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AppLayout } from "@/components/layouts/app-layout";
import { JoinCommunityButton } from "@/components/join-community-button";

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
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Communities</h1>
          <Link href="/create">
            <Button className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create a Community</span>
            </Button>
          </Link>
        </div>
        <div className="space-y-6">
          {communities.length === 0 ? (
            <div className="text-gray-500 text-center">No communities found.</div>
          ) : (
            communities.map((c) => (
              <Card key={c.id} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 flex flex-col gap-2">
                      <Link href={`/communities/${c.id}`} className="text-lg font-semibold text-green-600 hover:underline">
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
                    <div className="ml-4 flex-shrink-0">
                      <JoinCommunityButton 
                        communityId={c.id} 
                        communityName={c.name}
                      />
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