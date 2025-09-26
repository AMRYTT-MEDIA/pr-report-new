"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload, List, BarChart3 } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/pr-reports",
      label: "Upload CSV",
      icon: Upload,
    },
    {
      href: "/pr-reports-list",
      label: "View Reports",
      icon: List,
    },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <BarChart3 className="w-8 h-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-slate-900">
                  PR Boost
                </span>
              </Link>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? "border-blue-500 text-slate-900"
                        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
