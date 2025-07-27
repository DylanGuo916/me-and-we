import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layouts/app-layout";
import { User, Settings, Bell, Shield, HelpCircle } from "lucide-react";

export default function ProfilePage() {
  return (
    <AppLayout showSidebar={false} showRightSidebar={false}>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">John Doe</h1>
                  <p className="text-gray-600">@johndoe</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Blockchain enthusiast and content creator. Building the
                    future of decentralized social media.
                  </p>
                  <div className="flex items-center space-x-4 mt-4">
                    <Button>Edit Profile</Button>
                    <Button variant="outline">Share Profile</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="font-semibold text-gray-900">
                        My First m&W DAO Post
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        This is my first post on m&W DAO. I'm excited to be part
                        of this amazing community...
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>2 hours ago</span>
                        <span>•</span>
                        <span>5 comments</span>
                        <span>•</span>
                        <span>$2.45 earned</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="font-semibold text-gray-900">
                        Thoughts on Cryptocurrency
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Sharing my thoughts on the current state of
                        cryptocurrency markets...
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>1 day ago</span>
                        <span>•</span>
                        <span>12 comments</span>
                        <span>•</span>
                        <span>$8.75 earned</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Content */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Communities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">#m&W DAO</span>
                      <span className="text-xs text-gray-500">Member</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">#cryptocurrency</span>
                      <span className="text-xs text-gray-500">Member</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">#technology</span>
                      <span className="text-xs text-gray-500">Moderator</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
