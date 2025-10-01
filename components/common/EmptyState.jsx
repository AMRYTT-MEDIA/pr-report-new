import React from "react";
import { NoDataFound } from "../icon";
import { Button } from "../ui/button";

const EmptyState = ({
  title = "No Data Found...",
  description = "",
  actionText = "",
  onAction = null,
  iconWidth = 94,
  iconHeight = 118,
  className = "",
}) => (
  <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
    <NoDataFound width={iconWidth} height={iconHeight} />
    <p className="text-slate-800 text-sm font-semibold">{title}</p>
    {description && <p className="text-slate-500 text-sm text-center max-w-md">{description}</p>}
    {onAction && actionText && (
      <Button onClick={onAction} variant="outline" size="sm" className="mt-2">
        {actionText}
      </Button>
    )}
  </div>
);

export default EmptyState;
