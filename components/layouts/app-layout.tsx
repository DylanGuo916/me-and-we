"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { AppRightSidebar } from "./app-right-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
  showRightSidebar?: boolean;
  rightSidebarContent?: React.ReactNode;
}

export function AppLayout({ 
  children, 
  showRightSidebar = true,
  rightSidebarContent 
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(showRightSidebar);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setRightSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleRightSidebar = () => setRightSidebarOpen(!rightSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <AppSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <AppHeader 
          onToggleSidebar={toggleSidebar}
          onToggleRightSidebar={toggleRightSidebar}
          rightSidebarOpen={rightSidebarOpen}
        />

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

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