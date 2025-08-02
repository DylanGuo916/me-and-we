import { useState } from "react";

interface UseAvatarUploadReturn {
  uploadAvatar: (file: File) => Promise<{ success: boolean; error?: string; avatar?: string }>;
  uploading: boolean;
}

export function useAvatarUpload(): UseAvatarUploadReturn {
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (file: File): Promise<{ success: boolean; error?: string; avatar?: string }> => {
    try {
      setUploading(true);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      
      const response = await fetch(`${baseUrl}/api/user/avatar?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        credentials: 'include',
        body: file, // 直接发送文件对象
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to upload avatar'
        };
      }

      return {
        success: true,
        avatar: data.avatar
      };

    } catch (error) {
      console.error('Error uploading avatar:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadAvatar,
    uploading
  };
} 