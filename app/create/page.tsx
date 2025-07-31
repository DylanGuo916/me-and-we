"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateCommunityPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      alert("请填写所有必填字段");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 构建API请求URL
    //   const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
    //     (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const baseUrl = 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/communities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 包含认证cookie
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // 处理特定的错误状态码
        if (response.status === 401) {
          alert("请先登录");
          return;
        }
        
        if (response.status === 409) {
          alert("社区名称已存在");
          return;
        }
        
        throw new Error(errorData.error || `创建失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("社区创建成功:", result);
      
      // 创建成功后跳转到社区页面
      router.push("/communities");
    } catch (error) {
      console.error("创建失败:", error);
      const errorMessage = error instanceof Error ? error.message : "创建失败，请重试";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">创建社区</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 社区名称 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">社区名称</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="输入社区名称..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-lg"
                  maxLength={50}
                />
                <div className="text-sm text-gray-500">
                  {name.length}/50 字符
                </div>
                <div className="text-xs text-gray-400">
                  社区名称应该是描述性的，帮助用户了解社区的主题。
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 社区描述 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">社区描述</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Textarea
                  placeholder="描述你的社区..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={500}
                />
                <div className="text-sm text-gray-500">
                  {description.length}/500 字符
                </div>
                <div className="text-xs text-gray-400">
                  详细描述社区的目的、规则和期望的内容类型。
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 社区规则提示 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">社区规则</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 确保社区名称和描述准确反映社区内容</li>
                    <li>• 制定清晰的社区规则和指导原则</li>
                    <li>• 定期监控和管理社区内容</li>
                    <li>• 尊重所有成员的权利和隐私</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !description.trim()}
              className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>创建中...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>创建社区</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 