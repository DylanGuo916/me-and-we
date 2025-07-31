"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { User, Camera, X } from "lucide-react";
import { useAvatarUpload } from "@/hooks/use-avatar-upload";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onAvatarUpdate: (avatar: string) => void;
  size?: "sm" | "md" | "lg";
}

export function AvatarUpload({ currentAvatar, onAvatarUpdate, size = "md" }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, uploading } = useAvatarUpload();
  const { toast } = useToast();

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

    // 创建预览URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const result = await uploadAvatar(file);
    
    if (result.success && result.avatar) {
      onAvatarUpdate(result.avatar);
      setPreviewUrl(null);
      // 清除文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast({
        title: "Success",
        description: "Avatar updated successfully!",
      });
    } else {
      toast({
        title: "Upload failed",
        description: result.error || "Failed to upload avatar",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayAvatar = previewUrl || currentAvatar;

  return (
    <div className="relative">
      {/* 头像显示区域 */}
      <div
        className={`${sizeClasses[size]} relative rounded-full overflow-hidden cursor-pointer transition-all duration-200 ${
          isHovered ? 'ring-2 ring-blue-500' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {displayAvatar ? (
          <img
            src={displayAvatar}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <User className={`${iconSizes[size]} text-gray-600`} />
          </div>
        )}

        {/* 悬停时的相机图标 */}
        {isHovered && !previewUrl && !uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Camera className={`${iconSizes[size]} text-white`} />
          </div>
        )}

        {/* 上传中的遮罩 */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span className="text-white text-xs">Uploading...</span>
            </div>
          </div>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 预览模式下的操作按钮 */}
      {previewUrl && !uploading && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={uploading}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={uploading}
            className="bg-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 