"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppRightSidebarProps {
  children?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

// 默认的右侧边栏内容
function DefaultRightSidebarContent() {
  const cryptoData = [
    { name: "STEEM", price: "0.16", change: "+2.5%" },
    { name: "TRX", price: "0.31", change: "-1.2%" },
    { name: "JST", price: "0.038", change: "+0.8%" },
    { name: "BTC", price: "119199.29", change: "+3.4%" },
  ];

  const trendingCommunities = [
    "SteemitCryptoAcademy",
    "Newcomers' Community",
    "আমার বাংলা ব্লগ",
    "Korea • 한국 • KR • KO",
    "Steem Alliance",
    "STEEM CN/中文",
    "WORLD OF XPILAR",
    "AVLE 일상",
    "Comunidad Latina"
  ];

  return (
    <div className="space-y-6">
      {/* Announcements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Steemit Challenge Season 25 - Week 6</h4>
            <p className="text-sm text-blue-700 mt-1">Join the latest challenge and earn rewards!</p>
            <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800">
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Useful Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Useful Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="link" className="p-0 h-auto justify-start text-blue-600 hover:text-blue-800">
            Newcomers Guide
          </Button>
          <Button variant="link" className="p-0 h-auto justify-start text-blue-600 hover:text-blue-800">
            Latest Updates from @dip.team
          </Button>
        </CardContent>
      </Card>

      {/* Trending Communities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Trending Communities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {trendingCommunities.map((community, index) => (
            <div
              key={index}
              className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <span className="text-sm text-gray-700">#{community}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Coin Marketplace */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Coin Marketplace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cryptoData.map((crypto) => (
            <div key={crypto.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{crypto.name}</span>
                <span className="text-sm text-gray-600">{crypto.price}</span>
              </div>
              <div className="h-16 bg-gray-50 rounded flex items-center justify-center">
                <svg width="200" height="40" className="text-green-500">
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    points={`0,30 50,${20 + Math.random() * 20} 100,${15 + Math.random() * 20} 150,${10 + Math.random() * 20} 200,${5 + Math.random() * 20}`}
                  />
                </svg>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{crypto.name}</span>
                <span className={crypto.change.startsWith("+") ? "text-green-500" : "text-red-500"}>
                  {crypto.change}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function AppRightSidebar({ 
  children, 
  isOpen, 
  onToggle, 
  isMobile 
}: AppRightSidebarProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      {/* Right Sidebar */}
      <aside
        className={cn(
          "bg-white border-l border-gray-200 transition-all duration-300 z-50",
          isMobile 
            ? "fixed inset-y-0 right-0 transform transition-transform duration-300 ease-in-out"
            : "relative",
          isMobile && !isOpen && "translate-x-full",
          !isMobile && isOpen ? "w-80" : "w-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children || <DefaultRightSidebarContent />}
          </div>

          {/* Scroll to Top Button */}
          {showScrollTop && (
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={scrollToTop}
                className="w-full"
              >
                <ChevronUp className="w-4 h-4 mr-2" />
                Back to Top
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
} 