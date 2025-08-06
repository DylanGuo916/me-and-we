'use client';

import React, { useState } from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  FacebookIcon,
  XIcon,
  WhatsappIcon,
  TelegramIcon,
} from 'react-share';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';

interface SharePostProps {
  postId: string;
  title: string;
  content: string;
  authorName: string;
  communityName?: string;
  className?: string;
}

export function SharePost({
  postId,
  title,
  content,
  authorName,
  communityName,
  className,
}: SharePostProps) {
  const [copied, setCopied] = useState(false);
  
  // 构建分享URL
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/posts/${postId}`
    : `https://yourdomain.com/posts/${postId}`;
  
  // 构建分享文本
  const shareText = `${title} - 作者: ${authorName}${communityName ? ` | 社区: #${communityName}` : ''}`;
  
  // 复制链接功能
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('链接已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('复制失败，请手动复制');
    }
  };

  const shareButtons = [
    {
      name: '微信',
      button: (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            // 微信分享需要特殊处理，这里可以显示二维码或提示
            toast.info('请使用微信扫一扫分享');
          }}
        >
          <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold mr-2">
            微
          </div>
          微信
        </Button>
      ),
    },
    {
      name: '微信朋友圈',
      button: (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            // 微信朋友圈分享
            toast.info('请使用微信朋友圈分享');
          }}
        >
          <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold mr-2">
            圈
          </div>
          微信朋友圈
        </Button>
      ),
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={`h-8 px-3 hover:bg-gray-100 ${className}`}>
          <Share2 className="w-4 h-4 mr-1" />
          <span>分享</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-900 mb-3">分享到</h4>
          
          {/* 国际社交平台 */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <FacebookShareButton url={shareUrl} hashtag="#分享">
              <div className="flex flex-col items-center space-y-1">
                <FacebookIcon size={32} round />
                <span className="text-xs text-gray-600">Facebook</span>
              </div>
            </FacebookShareButton>
            
            <TwitterShareButton url={shareUrl} title={shareText}>
              <div className="flex flex-col items-center space-y-1">
                <XIcon size={32} round />
                <span className="text-xs text-gray-600">X</span>
              </div>
            </TwitterShareButton>
            
            <WhatsappShareButton url={shareUrl} title={shareText}>
              <div className="flex flex-col items-center space-y-1">
                <WhatsappIcon size={32} round />
                <span className="text-xs text-gray-600">WhatsApp</span>
              </div>
            </WhatsappShareButton>
            
            <TelegramShareButton url={shareUrl} title={shareText}>
              <div className="flex flex-col items-center space-y-1">
                <TelegramIcon size={32} round />
                <span className="text-xs text-gray-600">Telegram</span>
              </div>
            </TelegramShareButton>
          </div>
          
          {/* 国内社交平台 */}
          {/* <div className="space-y-1">
            {shareButtons.map((item) => (
              <div key={item.name}>
                {item.button}
              </div>
            ))}
          </div> */}
          
          {/* 复制链接 */}
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? '已复制' : '复制链接'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 