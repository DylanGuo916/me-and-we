"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, FileText, Users, Hash, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useUserCommunities } from "@/hooks/use-user-communities";
import { AppLayout } from "@/components/layouts/app-layout";
import { FormEditor } from "@/components/tiptap-templates/form/form-editor";

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

  // Use real community data
  const {
    communities,
    loading: communitiesLoading,
    error: communitiesError,
  } = useUserCommunities();

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !content.trim() ||
      !selectedCommunity ||
      !originalAuthor.trim() ||
      !originalLink.trim()
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build API request URL
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");

      const response = await fetch(`${baseUrl}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include authentication cookies
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

        // Handle specific error status codes
        if (response.status === 401) {
          alert("Please login first");
          return;
        }

        if (response.status === 403) {
          alert(
            "You are not a member of this community and cannot publish articles"
          );
          return;
        }

        if (response.status === 404) {
          alert("Community does not exist");
          return;
        }

        throw new Error(
          errorData.error || `Publish failed: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Article published successfully:", result);

      // Redirect to homepage after successful publication
      router.push("/");
    } catch (error) {
      console.error("Publish failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Publish failed, please try again";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout showSidebar={false} showRightSidebar={false}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </Button>
        </div>

        {/* Title Section */}
        <div className="max-w-6xl mx-auto px-4 mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Submit Article</h1>
          <p className="text-gray-600">Share interesting content with your community</p>
        </div>

        {/* Error Alert */}
        {communitiesError && (
          <div className="max-w-6xl mx-auto px-4 mb-6">
            <Alert variant="destructive">
              <AlertDescription>{communitiesError}</AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <FileText className="w-5 h-5 text-green-600" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Article Title *
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter a compelling title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-lg h-12"
                      maxLength={100}
                      required
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {title.length}/100 characters
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Article Content */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <FileText className="w-5 h-5 text-green-600" />
                    Article Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormEditor
                    content={content}
                    onUpdate={setContent}
                    placeholder="Share your thoughts and insights..."
                    minHeight={400}
                    maxHeight={400}
                  />
                </CardContent>
              </Card>

              {/* Author Information */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Users className="w-5 h-5 text-green-600" />
                    Source Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Original Author *
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter original author name or organization..."
                      value={originalAuthor}
                      onChange={(e) => setOriginalAuthor(e.target.value)}
                      maxLength={100}
                      required
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {originalAuthor.length}/100 characters
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Original Link *
                    </label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={originalLink}
                      onChange={(e) => setOriginalLink(e.target.value)}
                      required
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      Required for proper attribution
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Community Selection */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Building2 className="w-5 h-5 text-green-600" />
                    Select Community
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {communitiesLoading ? (
                    <div className="flex items-center gap-2 py-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-500">
                        Loading communities...
                      </span>
                    </div>
                  ) : communities.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-3">
                        You haven't joined any communities yet
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/create")}
                        className="w-full"
                      >
                        Create Community
                      </Button>
                    </div>
                  ) : (
                    <Select
                      value={selectedCommunity}
                      onValueChange={setSelectedCommunity}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a community" />
                      </SelectTrigger>
                      <SelectContent>
                        {communities.map((community) => (
                          <SelectItem key={community.id} value={community.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {community.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {community.description || "No description"}
                              </span>
                              <span className="text-xs text-gray-400">
                                {community.role} • {community.memberCount} members
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Hash className="w-5 h-5 text-green-600" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddTag())
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer hover:bg-gray-200"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          #{tag}
                          <span className="ml-1 text-gray-500">×</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="sticky top-6">
                <Card className="bg-white shadow-sm">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        disabled={
                          isSubmitting ||
                          !title.trim() ||
                          !content.trim() ||
                          !selectedCommunity ||
                          !originalAuthor.trim() ||
                          !originalLink.trim() ||
                          communitiesLoading
                        }
                        className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Publish Article
                          </>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
