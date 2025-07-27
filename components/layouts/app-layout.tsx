"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { AppRightSidebar } from "./app-right-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showRightSidebar?: boolean;
  rightSidebarContent?: React.ReactNode;
}

export function AppLayout({
  children,
  showSidebar = true,
  showRightSidebar = true,
  rightSidebarContent,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(showSidebar);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(showRightSidebar);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setRightSidebarOpen(false);
    } else {
      setSidebarOpen(showSidebar);
      setRightSidebarOpen(showRightSidebar);
    }
  }, [isMobile, showSidebar, showRightSidebar]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleRightSidebar = () => setRightSidebarOpen(!rightSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <AppHeader
          onToggleSidebar={showSidebar ? toggleSidebar : undefined}
          onToggleRightSidebar={
            showRightSidebar ? toggleRightSidebar : undefined
          }
          rightSidebarOpen={rightSidebarOpen}
        />

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          {showSidebar && (
            <AppSidebar
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
              isMobile={isMobile}
            />
          )}
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">{children}</main>

          {/* Right Sidebar */}
          {showRightSidebar && (
            <AppRightSidebar
              isOpen={rightSidebarOpen}
              onToggle={toggleRightSidebar}
              isMobile={isMobile}
            >
              {rightSidebarContent}
            </AppRightSidebar>
          )}
        </div>
      </div>
    </div>
  );
}
