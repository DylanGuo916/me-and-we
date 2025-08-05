"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserCommunities } from "@/hooks/use-user-communities";

export default function SubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [originalAuthor, setOriginalAuthor] = useState("");
  const [originalLink, setOriginalLink] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 使用真实的社区数据
  const { communities, loading: communitiesLoading, error: communitiesError } = useUserCommunities();

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !selectedCommunity || !originalAuthor.trim() || !originalLink.trim()) {
      alert("请填写所有必填字段");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 构建API请求URL
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      
      const response = await fetch(`${baseUrl}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 包含认证cookie
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          originalAuthor: originalAuthor.trim(),
          originalLink: originalLink.trim(),
          communityId: selectedCommunity,
          tags: tags,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // 处理特定的错误状态码
        if (response.status === 401) {
          alert("请先登录");
          return;
        }
        
        if (response.status === 403) {
          alert("您不是该社区的成员，无法发布文章");
          return;
        }
        
        if (response.status === 404) {
          alert("社区不存在");
          return;
        }
        
        throw new Error(errorData.error || `发布失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("文章发布成功:", result);
      
      // 发布成功后跳转到首页
      router.push("/");
    } catch (error) {
      console.error("发布失败:", error);
      const errorMessage = error instanceof Error ? error.message : "发布失败，请重试";
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
          <h1 className="text-xl font-semibold text-gray-900">发表文章</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 错误提示 */}
          {communitiesError && (
            <Alert variant="destructive">
              <AlertDescription>{communitiesError}</AlertDescription>
            </Alert>
          )}

          {/* 社区选择 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">选择社区</CardTitle>
            </CardHeader>
            <CardContent>
              {communitiesLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-500">加载社区中...</span>
                </div>
              ) : communities.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">您还没有加入任何社区</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push("/create")}
                  >
                    创建社区
                  </Button>
                </div>
              ) : (
                <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择一个社区" />
                  </SelectTrigger>
                  <SelectContent>
                    {communities.map((community) => (
                      <SelectItem key={community.id} value={community.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{community.name}</span>
                          <span className="text-sm text-gray-500">
                            {community.description || "暂无描述"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {community.role} • {community.memberCount} 成员 • {community.postCount} 文章
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* 文章标题 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">文章标题</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="输入文章标题..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
                maxLength={100}
              />
              <div className="text-sm text-gray-500 mt-2">
                {title.length}/100 字符
              </div>
            </CardContent>
          </Card>

          {/* 原作者 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">原作者 *</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="输入原作者姓名或机构..."
                value={originalAuthor}
                onChange={(e) => setOriginalAuthor(e.target.value)}
                className="text-lg"
                maxLength={100}
                required
              />
              <div className="text-sm text-gray-500 mt-2">
                {originalAuthor.length}/100 字符
              </div>
            </CardContent>
          </Card>

          {/* 原文链接 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">原文链接 *</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="url"
                placeholder="输入原文链接..."
                value={originalLink}
                onChange={(e) => setOriginalLink(e.target.value)}
                className="text-lg"
                required
              />
              <div className="text-sm text-gray-500 mt-2">
                必填字段，用于引用原文出处
              </div>
            </CardContent>
          </Card>

          {/* 文章内容 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">文章内容</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="分享你的想法..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] resize-none"
                maxLength={10000}
              />
              <div className="text-sm text-gray-500 mt-2">
                {content.length}/10000 字符
              </div>
            </CardContent>
          </Card>

          {/* 标签 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">标签</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="添加标签..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    className="flex items-center space-x-2"
                  >
                    <span>添加</span>
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <div
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm flex items-center space-x-1 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <span>#{tag}</span>
                        <span className="text-gray-500">×</span>
                      </div>
                    ))}
                  </div>
                )}
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
              disabled={isSubmitting || !title.trim() || !content.trim() || !selectedCommunity || !originalAuthor.trim() || !originalLink.trim() || communitiesLoading}
              className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>发布中...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>发布文章</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 