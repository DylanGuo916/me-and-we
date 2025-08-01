"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface JoinCommunityButtonProps {
  communityId: string;
  communityName: string;
  className?: string;
}

export function JoinCommunityButton({ 
  communityId, 
  communityName, 
  className = "" 
}: JoinCommunityButtonProps) {
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const { toast } = useToast();

  // 检查用户是否已经是社区成员
  const checkMembership = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      
      const response = await fetch(`${baseUrl}/api/communities/${communityId}/join`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setIsMember(data.isMember);
        setIsOwner(data.isOwner);
      } else if (response.status === 401) {
        // 用户未登录，显示登录提示
        setIsMember(false);
        setIsOwner(false);
      }
    } catch (error) {
      console.error('Error checking membership:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加入社区
  const handleJoin = async () => {
    try {
      setJoining(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      
      const response = await fetch(`${baseUrl}/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setIsMember(true);
        toast({
          title: "Success",
          description: `Successfully joined ${communityName}!`,
        });
      } else if (response.status === 401) {
        toast({
          title: "Authentication required",
          description: "Please log in to join communities.",
          variant: "destructive",
        });
      } else if (response.status === 409) {
        if (data.isMember) {
          toast({
            title: "Already a member",
            description: `You are already a member of ${communityName}.`,
          });
        } else if (data.isOwner) {
          toast({
            title: "Community owner",
            description: `You are the owner of ${communityName}.`,
          });
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to join community",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    checkMembership();
  }, [communityId]);

//   // 如果用户是所有者，不显示按钮
//   if (isOwner) {
//     return null;
//   }

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        disabled 
        className={`animate-pulse ${className}`}
      >
        Loading...
      </Button>
    );
  }

  // 如果已经是成员，显示已加入状态
  if (isMember) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        disabled 
        className={`text-green-600 border-green-600 ${className}`}
      >
        Joined
      </Button>
    );
  }

  // 显示加入按钮
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleJoin}
      disabled={joining}
      className={`hover:bg-green-50 hover:border-green-500 hover:text-green-600 ${className}`}
    >
      {joining ? "Joining..." : "Join"}
    </Button>
  );
} 