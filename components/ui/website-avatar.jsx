import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Skeleton } from "./skeleton";

const WebsiteAvatar = ({
  logoUrl,
  websiteName,
  size = "default",
  className = "",
  onImageLoad,
  onImageError,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!logoUrl);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setImageLoaded(true);
    onImageLoad && onImageLoad();
  }, [onImageLoad]);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setImageError(true);
    onImageError && onImageError();
  }, [onImageError]);

  // Size configurations
  const sizeConfig = {
    small: {
      container: "w-[24px] h-[24px]",
      text: "text-xs",
    },
    default: {
      container: "w-[32px] sm:w-[38px] h-[32px] sm:h-[38px]",
      text: "text-base sm:text-lg",
    },
    large: {
      container: "w-[48px] h-[48px]",
      text: "text-xl",
    },
  };

  const currentSize = sizeConfig[size] || sizeConfig.default;

  // If we have a logo URL and no error, try to display the image
  if (logoUrl && !imageError) {
    return (
      <div className={`relative ${currentSize.container} ${className}`}>
        {isLoading && <Skeleton className="w-full h-full rounded" />}
        <Image
          src={logoUrl}
          alt={websiteName || "Website logo"}
          fill
          className={`object-contain ${
            isLoading ? "opacity-0" : "opacity-100"
          } transition-opacity duration-200`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback to colored initial
  if (!websiteName) {
    return (
      <div
        className={`${currentSize.container} rounded-full flex items-center justify-center border-2 text-gray-700 border-gray-300 bg-gray-50 ${className}`}
      >
        <span className={`font-bold tracking-wide ${currentSize.text}`}>-</span>
      </div>
    );
  }

  const firstChar = websiteName.charAt(0).toUpperCase();
  const colorClasses = [
    "text-blue-700 border-blue-300 bg-blue-50",
    "text-green-700 border-green-300 bg-green-50",
    "text-purple-700 border-purple-300 bg-purple-10",
    "text-orange-700 border-orange-300 bg-orange-10",
    "text-red-700 border-red-300 bg-red-50",
    "text-indigo-700 border-indigo-300 bg-indigo-50",
  ];

  // Use website name to generate consistent color
  const colorIndex =
    websiteName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colorClasses.length;
  const colorClass = colorClasses[colorIndex];

  return (
    <div
      className={`${currentSize.container} rounded-full flex items-center justify-center border-2 font-bold tracking-wide ${colorClass} ${className}`}
    >
      <span className={currentSize.text}>{firstChar}</span>
    </div>
  );
};

export default WebsiteAvatar;
