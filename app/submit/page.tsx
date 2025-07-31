"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Image, Hash, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const communities = [
    { id: "tech", name: "Technology", description: "讨论技术相关话题" },
    { id: "lifestyle", name: "Lifestyle", description: "生活方式和日常分享" },
    { id: "news", name: "News", description: "新闻和时事讨论" },
    { id: "entertainment", name: "Entertainment", description: "娱乐和休闲" },
    { id: "sports", name: "Sports", description: "体育和运动" },
  ];

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
    if (!title.trim() || !content.trim() || !selectedCommunity) {
      alert("请填写所有必填字段");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 这里添加提交文章的逻辑
      console.log("提交文章:", {
        title,
        content,
        community: selectedCommunity,
        tags,
      });
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 提交成功后跳转到首页
      router.push("/");
    } catch (error) {
      console.error("提交失败:", error);
      alert("提交失败，请重试");
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
          {/* 社区选择 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">选择社区</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                <SelectTrigger>
                  <SelectValue placeholder="选择一个社区" />
                </SelectTrigger>
                <SelectContent>
                  {communities.map((community) => (
                    <SelectItem key={community.id} value={community.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{community.name}</span>
                        <span className="text-sm text-gray-500">{community.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    <Hash className="w-4 h-4" />
                    <span>添加</span>
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center space-x-1 cursor-pointer hover:bg-gray-300"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <span>#{tag}</span>
                        <span className="text-gray-500">×</span>
                      </Badge>
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
              disabled={isSubmitting || !title.trim() || !content.trim() || !selectedCommunity}
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