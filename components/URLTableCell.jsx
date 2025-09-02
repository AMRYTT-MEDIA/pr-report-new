"use client";

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const URLTableCell = ({
  url,
  textMaxWidth = "max-w-[200px]",
  className = "",
  showIcon = true,
  iconSize = "h-3 w-3",
  textColor = "text-blue-600",
  iconColor = "text-blue-600",
}) => {
  const handleClick = () => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <div className={cn("flex items-start gap-1", className)}>
      <div
        onClick={handleClick}
        className={cn("break-all cursor-pointer", textMaxWidth, textColor)}
      >
        {url}
      </div>
      {showIcon && (
        <button
          onClick={handleClick}
          className="flex-shrink-0 hover:bg-gray-100 rounded transition-colors mt-1"
          title="Open link in new tab"
        >
          <ExternalLink className={cn(iconColor, iconSize)} />
        </button>
      )}
    </div>
  );
};

export default URLTableCell;
