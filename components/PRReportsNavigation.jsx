"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  FileText,
  List,
  Eye,
  Upload,
  BarChart3,
  Home,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import Image from "next/image";
import { useMemo } from "react";

export default function PRReportsNavigation({ isViewPRPage = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navigationItems = [
    {
      name: "Upload Reports",
      href: "/pr-reports",
      icon: Upload,
      description: "Import CSV files and generate PR reports",
    },
    {
      name: "All Reports",
      href: "/pr-reports-list",
      icon: List,
      description: "View and manage all your PR reports",
    },
    // {
    //   name: "View Report",
    //   href: "/view-pr",
    //   icon: Eye,
    //   description: "Detailed view of individual reports",
    // },
  ];

  const isActiveRoute = (href) => {
    return href === pathname;
  };

  const handleNavigation = (href) => {
    router.push(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // If it's a view-pr page, show only centered logo
  // if (isViewPRPage) {
  //   return (
  //     <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
  //       <div className="container mx-auto">
  //         <div className="flex justify-center items-center h-16">
  //           <Image
  //             src="/guestpost-link.webp"
  //             alt="PR Reports"
  //             width={223}
  //             height={45}
  //           />
  //         </div>
  //       </div>
  //     </nav>
  //   );
  // }

  if (isViewPRPage) return null;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto ">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            {/* <div className="flex items-center space-x-2"> */}
            {/* <BarChart3 className="h-8 w-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">
                PR Reports
              </span> */}
            <Image
              src="/guestpost-link.webp"
              alt="PR Reports"
              width={223}
              height={45}
            />
            {/* </div> */}

            {/* Home Button */}
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button> */}
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);

              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-orange-500   text-white hover:bg-orange-500"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                  onClick={() => handleNavigation(item.href)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Button>
              );
            })}
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-3">
            {user && (
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.email || user.name || "User"}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 hover:border-red-300"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);

              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start space-x-3 px-3 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                  onClick={() => handleNavigation(item.href)}
                >
                  <Icon className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </Button>
              );
            })}

            {/* Mobile User Info */}
            {user && (
              <div className="px-3 py-2 text-sm text-gray-600 border-t border-gray-200 mt-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{user.email || user.name || "User"}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
