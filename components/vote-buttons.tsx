"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  postId: string;
  initialScore?: number;
  initialUserVote?: "UP" | "DOWN" | null;
  className?: string;
}

export function VoteButtons({ 
  postId, 
  initialScore = 0, 
  initialUserVote = null,
  className 
}: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<"UP" | "DOWN" | null>(initialUserVote);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVote = async (voteType: "UP" | "DOWN") => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "投票失败");
      }

      const data = await response.json();
      setScore(data.score);
      setUserVote(data.userVote);

      // 显示成功消息
      if (data.userVote === voteType) {
        toast({
          title: voteType === "UP" ? "点赞成功" : "点踩成功",
        });
      } else if (data.userVote === null) {
        toast({
          title: "取消投票成功",
        });
      } else {
        toast({
          title: "投票已更新",
        });
      }
    } catch (error) {
      console.error("投票错误:", error);
      toast({
        title: "投票失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0 hover:bg-gray-100 transition-colors",
          userVote === "UP" && "text-orange-500 bg-orange-50 hover:bg-orange-100"
        )}
        onClick={() => handleVote("UP")}
        disabled={isLoading}
      >
        <ArrowUp className="w-4 h-4" />
      </Button>
      
      <span className={cn(
        "font-medium text-gray-700 min-w-[2rem] text-center",
        score > 0 && "text-green-600",
        score < 0 && "text-red-600"
      )}>
        {score}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0 hover:bg-gray-100 transition-colors",
          userVote === "DOWN" && "text-blue-500 bg-blue-50 hover:bg-blue-100"
        )}
        onClick={() => handleVote("DOWN")}
        disabled={isLoading}
      >
        <ArrowDown className="w-4 h-4" />
      </Button>
    </div>
  );
} 