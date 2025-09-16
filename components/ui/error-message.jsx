import { InfoIcon } from "lucide-react";
import React from "react";

const ErrorMessage = ({ message, className = "", showIcon = true }) => {
  if (!message) return null;

  return (
    <div
      className={`flex items-center gap-[7px] text-danger-scale-60 font-inter text-xs font-medium leading-normal ${className}`}
    >
      {showIcon && <InfoIcon className="w-4 h-4 text-danger-scale-60" />}
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
