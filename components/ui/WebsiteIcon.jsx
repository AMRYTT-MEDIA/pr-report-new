import React from "react";
import Image from "next/image";
import { getLogoUrl } from "@/lib/utils";
import WebsiteAvatar from "./website-avatar";

const WebsiteIcon = ({
  logoFilename,
  websiteName,
  size = "default",
  className = "",
  containerClassName = "",
  imageClassName = "",
  width,
  height,
  alt,
  onImageLoad,
  onImageError,
  unoptimized,
}) => {
  // Size configurations for different use cases
  const sizeConfig = {
    small: {
      container: "w-[24px] h-[24px]",
      maxWidth: "max-w-[24px]",
      maxHeight: "max-h-[24px]",
      width: 24,
      height: 24,
    },
    default: {
      container: "w-[120px] sm:w-[137px] h-[38px]",
      maxWidth: "max-w-[120px] sm:max-w-[137px]",
      maxHeight: "max-h-[38px]",
      width: 138,
      height: 38,
    },
    large: {
      container: "w-[200px] h-[60px]",
      maxWidth: "max-w-[200px]",
      maxHeight: "max-h-[60px]",
      width: 200,
      height: 60,
    },
    custom: {
      container: "",
      maxWidth: "",
      maxHeight: "",
      width: width || 138,
      height: height || 38,
    },
  };

  const currentSize = sizeConfig[size] || sizeConfig.default;

  // Get logo URL if filename is provided
  const logoUrl = logoFilename ? getLogoUrl(logoFilename) : null;

  // Determine if SVG for unoptimized flag
  const isSvg = logoFilename?.toLowerCase().includes(".svg") || false;
  const shouldUnoptimize = unoptimized !== undefined ? unoptimized : isSvg;

  // If we have a logo, display it
  if (logoUrl) {
    return (
      <div
        className={`flex items-center justify-center justify-self-center ${
          size !== "custom" ? currentSize.container : ""
        } ${containerClassName}`}
      >
        <Image
          src={logoUrl}
          alt={alt || websiteName || "Website logo"}
          width={currentSize.width}
          height={currentSize.height}
          unoptimized={true}
          className={`${
            size !== "custom"
              ? `${currentSize.maxWidth} ${currentSize.maxHeight}`
              : ""
          } object-contain w-full h-full ${imageClassName}`}
          onLoad={onImageLoad}
          onError={onImageError}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback to WebsiteAvatar if no logo
  return (
    <div className={`${containerClassName} flex items-center justify-center`}>
      <WebsiteAvatar
        websiteName={websiteName}
        size={size === "custom" ? "default" : size}
        className={className}
        onImageLoad={onImageLoad}
        onImageError={onImageError}
      />
    </div>
  );
};

export default WebsiteIcon;
