"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

const CommonBreadcrumb = ({ items = [] }) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <nav className="py-3" aria-label="Breadcrumb">
      <ol className="flex items-center  text-sm text-slate-600">
        {/* Home icon - always show first */}
        <li className="flex items-center ml-0">
          <Home className="h-4 w-4 text-slate-500" />
        </li>

        {items
          .filter((item) => item && typeof item === "object" && item.name)
          .map((item, index) => (
            <li
              key={item.href || item.name || index}
              className="flex items-center"
            >
              <ChevronRight className="h-4 w-4 mx-2 text-slate-400" />

              {item.current ? (
                <span
                  className="flex items-center gap-2 px-1.5 py-1 rounded bg-slate-100 text-slate-600 font-semibold text-xs leading-[1.45] font-['Inter']"
                  style={{ fontFeatureSettings: "'cv03' on, 'cv04' on" }}
                >
                  {item.name}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="text-slate-700 font-medium text-sm leading-[1.45] font-['Inter'] hover:text-slate-900 transition-colors duration-200"
                  style={{ fontFeatureSettings: "'cv03' on, 'cv04' on" }}
                >
                  {item.name}
                </Link>
              ) : (
                <span className="text-slate-700 font-medium text-sm leading-[1.45] font-['Inter']">
                  {item.name}
                </span>
              )}
            </li>
          ))}
      </ol>
    </nav>
  );
};

export default CommonBreadcrumb;
