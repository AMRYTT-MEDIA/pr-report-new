import React from "react";

const Loading = ({
  size = "md",
  className = "",
  color = "primary",
  text = "",
  showText = false,
  textColor = "white",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const colorClasses = {
    primary: "border-primary-60",
    white: "border-white",
    gray: "border-gray-400",
    purple: "border-purple-600",
  };

  // Special case for purple to match the original design
  const getBorderStyle = (color) => {
    if (color === "purple") {
      return "border-b-2 border-purple-600";
    }
    if (color === "white") {
      return "border-b-2 border-white";
    }
    return `border-2 border-gray-200 ${colorClasses[color]} border-t-transparent`;
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div
        className={`animate-spin rounded-full ${
          sizeClasses[size]
        } ${getBorderStyle(color)}`}
      />
      {showText && text && (
        <p className={`text-sm font-medium text-${textColor}`}>{text}</p>
      )}
    </div>
  );
};

export default Loading;
