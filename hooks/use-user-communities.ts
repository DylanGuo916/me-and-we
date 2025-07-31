import { useState, useEffect } from "react";

interface CommunityOwner {
  id: string;
  name: string;
  email: string;
}

interface UserCommunity {
  id: string;
  name: string;
  description: string | null;
  role: 'Owner' | 'Member';
  joinedAt: string;
  owner: CommunityOwner;
  memberCount: number;
  postCount: number;
  isOwner: boolean;
}

interface UserCommunitiesStats {
  totalCommunities: number;
  ownedCommunities: number;
  memberCommunities: number;
}

interface UserCommunitiesData {
  communities: UserCommunity[];
  stats: UserCommunitiesStats;
}

interface UseUserCommunitiesReturn {
  communities: UserCommunity[];
  stats: UserCommunitiesStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserCommunities(): UseUserCommunitiesReturn {
  const [communities, setCommunities] = useState<UserCommunity[]>([]);
  const [stats, setStats] = useState<UserCommunitiesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserCommunities = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      
      const response = await fetch(`${baseUrl}/api/user/communities`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 包含认证cookie
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("请先登录");
          return;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `获取用户社区失败: ${response.status}`);
      }

      const data: UserCommunitiesData = await response.json();
      setCommunities(data.communities);
      setStats(data.stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取用户社区时发生未知错误";
      setError(errorMessage);
      console.error('Error fetching user communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchUserCommunities();
  };

  useEffect(() => {
    fetchUserCommunities();
  }, []);

  return {
    communities,
    stats,
    loading,
    error,
    refetch,
  };
} 