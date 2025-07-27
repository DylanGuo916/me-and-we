"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Home,
  Users,
  User,
  Wallet,
  Settings,
  Compass,
  FileText,
  UserPlus,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: Compass, label: "Explore", href: "/" },
  { icon: FileText, label: "All Posts", href: "/posts" },
  { icon: Users, label: "Communities", href: "/communities" },
  { icon: UserPlus, label: "My Friends", href: "/friends" },
  { icon: Bell, label: "My Subscriptions", href: "/subscriptions" },
  { icon: User, label: "My Profile", href: "/profile" },
  { icon: Wallet, label: "My Wallet", href: "/wallet" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function AppSidebar({ isOpen, onToggle, isMobile }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  // 移动端处理
  useEffect(() => {
    if (isMobile && isOpen) {
      // 移动端侧边栏打开时，添加遮罩
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, isOpen]);

  const SidebarItem = ({ item }: { item: SidebarItem }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link href={item.href}>
        <div
          className={cn(
            "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
            isActive
              ? "bg-green-100 text-green-700 border-l-4 border-green-500"
              : "text-gray-700 hover:bg-gray-100 hover:text-green-600"
          )}
        >
          <Icon className="w-5 h-5" />
          {!collapsed && (
            <span className="flex-1 font-medium">{item.label}</span>
          )}
          {item.badge && !collapsed && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 z-50",
          isMobile
            ? "fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out"
            : "relative",
          isMobile && !isOpen && "-translate-x-full",
          !isMobile && collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
                className="p-1"
              >
                {collapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {sidebarItems.map((item) => (
              <SidebarItem key={item.href} item={item} />
            ))}
          </nav>

          {/* User Section */}
          {session?.user && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user.email}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
