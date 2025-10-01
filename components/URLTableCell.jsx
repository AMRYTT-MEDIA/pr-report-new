"use client";

import { Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const URLTableCell = ({
  url,
  textMaxWidth = "max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[650px] 2xl:max-w-[800px]",
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

  const handleCopyLink = () => {
    if (url) {
      navigator.clipboard.writeText(url);
    }
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className={cn("flex items-start gap-1", className)}>
      <div
        onClick={handleClick}
        className={cn(
          "cursor-pointer truncate whitespace-nowrap lg:break-all lg:whitespace-normal",
          textMaxWidth,
          textColor
        )}
      >
        {url}
      </div>
      {showIcon && (
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleClick}
            className="flex-shrink-0 rounded transition-colors mt-1"
            title="Open link in new tab"
          >
            <ExternalLink className={cn(iconColor, iconSize)} />
          </button>
          <button onClick={handleCopyLink} className="flex-shrink-0 rounded transition-colors mt-1" title="Copy link">
            <Copy className="h-4 w-4 text-[#1E293B]" />
          </button>
        </div>
      )}
    </div>
  );
};

export default URLTableCell;
