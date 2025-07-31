import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  createdAt: Date;
  username: string;
}

interface Stats {
  totalPosts: number;
  totalCommunities: number;
  totalEarned: number;
}

interface Community {
  id: string;
  name: string;
  description?: string | null;
  role: string;
  memberCount: number;
  postCount: number;
  joinedAt: Date;
}

interface RecentPost {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  community?: {
    id: string;
    name: string;
  } | null;
  comments: number;
  earned: number;
}

interface UserProfile {
  user: User;
  stats: Stats;
  recentPosts: RecentPost[];
  communities: Community[];
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      
      const response = await fetch(`${baseUrl}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('请先登录');
        } else {
          setError('获取用户信息失败');
        }
        return;
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
} 