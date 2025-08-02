'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/layouts/app-layout';
import Image from 'next/image';

interface UploadResult {
  success: boolean;
  avatar?: string;
  message?: string;
  error?: string;
}

export default function AvatarUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!inputFileRef.current?.files) {
      toast({
        title: "Error",
        description: "No file selected",
        variant: "destructive",
      });
      return;
    }

    const file = inputFileRef.current.files[0];

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG, PNG, GIF, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      const response = await fetch(
        `/api/user/avatar?filename=${encodeURIComponent(file.name)}`,
        {
          method: 'POST',
          credentials: 'include',
          body: file,
        },
      );

      const result = await response.json() as UploadResult;

      if (response.ok && result.success) {
        setUploadResult(result);
        toast({
          title: "Success",
          description: "Avatar uploaded successfully!",
        });
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload avatar",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Upload Your Avatar</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Image
                </label>
                <input
                  id="avatar"
                  name="file"
                  ref={inputFileRef}
                  type="file"
                  accept="image/jpeg, image/png, image/gif, image/webp"
                  required
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={uploading}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                {uploading ? "Uploading..." : "Upload Avatar"}
              </Button>
            </form>

            {uploadResult?.avatar && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Avatar:</h3>
                <div className="flex items-center space-x-4">
                  <Image
                    src={uploadResult.avatar}
                    alt="Uploaded avatar"
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 truncate">
                      Avatar URL: <a href={uploadResult.avatar} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">{uploadResult.avatar}</a>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 