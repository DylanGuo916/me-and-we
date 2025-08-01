"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Menu,
  PanelLeftClose,
  PanelRightClose,
  PanelRight,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/user-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AppHeaderProps {
  onToggleSidebar: () => void;
  onToggleRightSidebar: () => void;
  rightSidebarOpen: boolean;
}

export function AppHeader({
  onToggleSidebar,
  onToggleRightSidebar,
  rightSidebarOpen,
}: AppHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 实现搜索功能
    console.log("Searching for:", searchQuery);
  };

  const handlePost = () => {
    // 导航到发表文章页面
    router.push("/submit");
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">m&W</span>
            </div>
            <span className="text-2xl font-light text-green-500 hidden sm:block">
              m&W
            </span>
          </Link>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search posts, communities, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-50 border-gray-200 focus:bg-white focus:border-green-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Right Sidebar Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleRightSidebar}
            className="hidden lg:flex"
          >
            {rightSidebarOpen ? (
              <PanelRightClose className="w-5 h-5" />
            ) : (
              <PanelRight className="w-5 h-5" />
            )}
          </Button>

          {/* Post Button */}
          <Button
            onClick={handlePost}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Post</span>
          </Button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
