import React from "react";

const Loading = ({
  size = "md",
  className = "",
  color = "primary",
  text = "",
  showText = false,
  textColor = "white",
  textPosition = "end", // "start", "end", "top", or "bottom"
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
    danger: "border-danger-60",
  };

  // Special case for purple to match the original design
  const getBorderStyle = (color) => {
    if (color === "purple") {
      return "border-b-2 border-purple-600";
    }
    if (color === "white") {
      return "border-b-2 border-white";
    }
    if (color === "danger") {
      return "border-b-2 border-danger-60";
    }
    return `border-2 border-gray-200 ${colorClasses[color]} border-t-transparent`;
  };

  const textColorClasses = {
    white: "text-white",
    black: "text-black",
    gray: "text-gray-600",
    primary: "text-primary-60",
  };

  // Handle different text positions
  const renderContent = () => {
    if (textPosition === "top" || textPosition === "bottom") {
      return (
        <div
          className={`flex flex-col items-center justify-center gap-2 ${className}`}
        >
          {showText && text && textPosition === "top" && (
            <p
              className={`text-sm font-medium ${
                textColorClasses[textColor] || textColorClasses.gray
              }`}
            >
              {text}
            </p>
          )}
          <div
            className={`animate-spin rounded-full ${
              sizeClasses[size]
            } ${getBorderStyle(color)}`}
          />
          {showText && text && textPosition === "bottom" && (
            <p
              className={`text-sm font-medium ${
                textColorClasses[textColor] || textColorClasses.gray
              }`}
            >
              {text}
            </p>
          )}
        </div>
      );
    }

    // Horizontal layout for start/end positions
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        {showText && text && textPosition === "start" && (
          <p
            className={`text-sm font-medium ${
              textColorClasses[textColor] || textColorClasses.gray
            }`}
          >
            {text}
          </p>
        )}
        <div
          className={`animate-spin rounded-full ${
            sizeClasses[size]
          } ${getBorderStyle(color)}`}
        />
        {showText && text && textPosition === "end" && (
          <p
            className={`text-sm font-medium ${
              textColorClasses[textColor] || textColorClasses.gray
            }`}
          >
            {text}
          </p>
        )}
      </div>
    );
  };

  return renderContent();
};

export default Loading;
