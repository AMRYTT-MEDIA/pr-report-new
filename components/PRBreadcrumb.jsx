"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export default function PRBreadcrumb() {
  const pathname = usePathname();

  const getBreadcrumbItems = () => {
    const items = [];

    if (pathname.startsWith("/pr-reports")) {
      items.push({ name: "Upload Reports", href: "/pr-reports" });
    }

    if (pathname.startsWith("/pr-reports-list")) {
      items.push({ name: "All Reports", href: "/pr-reports-list" });
    }

    if (pathname.startsWith("/view-pr/")) {
      const reportId = pathname.split("/")[2];
      items.push({ name: "All Reports", href: "/pr-reports-list" });
      items.push({ name: `View Report`, href: pathname, current: true });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav className="py-3">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        <li>
          <Link
            href="/pr-reports"
            className="flex items-center hover:text-gray-900 transition-colors"
          >
            <Home className="h-4 w-4" />
            {/* Home */}
          </Link>
        </li>

        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            {item.current ? (
              <span className="text-gray-900 font-medium">{item.name}</span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-gray-900 transition-colors"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
