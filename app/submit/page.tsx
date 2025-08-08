"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
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
import { useUserCommunities } from "@/hooks/use-user-communities";
import { AppLayout } from "@/components/layouts/app-layout";

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
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        {/* <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-2xl font-bold">Submit Article</h1>
          </div>
        </div> */}

        <div className="space-y-6">
          {/* Error Alert */}
          {communitiesError && (
            <Alert variant="destructive">
              <AlertDescription>{communitiesError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Community Selection */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Select Community</CardTitle>
              </CardHeader>
              <CardContent>
                {communitiesLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-500">
                      Loading communities...
                    </span>
                  </div>
                ) : communities.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-2">
                      You haven't joined any communities yet
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/create")}
                    >
                      Create Community
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={selectedCommunity}
                    onValueChange={setSelectedCommunity}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a community" />
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
                              • {community.postCount} posts
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>

            {/* Article Title */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Article Title</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="text"
                  placeholder="Enter article title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg"
                  maxLength={100}
                />
                <div className="text-sm text-gray-500 mt-2">
                  {title.length}/100 characters
                </div>
              </CardContent>
            </Card>

            {/* Original Author */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Original Author *</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="text"
                  placeholder="Enter original author name or organization..."
                  value={originalAuthor}
                  onChange={(e) => setOriginalAuthor(e.target.value)}
                  className="text-lg"
                  maxLength={100}
                  required
                />
                <div className="text-sm text-gray-500 mt-2">
                  {originalAuthor.length}/100 characters
                </div>
              </CardContent>
            </Card>

            {/* Original Link */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Original Link *</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="url"
                  placeholder="Enter original article link..."
                  value={originalLink}
                  onChange={(e) => setOriginalLink(e.target.value)}
                  className="text-lg"
                  required
                />
                <div className="text-sm text-gray-500 mt-2">
                  Required field for citing the original source
                </div>
              </CardContent>
            </Card>

            {/* Article Content */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Article Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Share your thoughts..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[300px] resize-none"
                  maxLength={10000}
                />
                <div className="text-sm text-gray-500 mt-2">
                  {content.length}/10000 characters
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Add tags..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddTag())
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                      className="flex items-center space-x-2"
                    >
                      <span>Add</span>
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

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
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
                className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publish</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
