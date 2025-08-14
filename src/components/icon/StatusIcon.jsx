import React from "react";

const StatusIcon = ({
  props,
  width = 35,
  height = 34,
  color = "#6366F1",
  className,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 34 34"
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M13.0836 24.0833H10.2502V14.1667H13.0836V24.0833ZM18.7502 24.0833H15.9169V9.91667H18.7502V24.0833ZM24.4169 24.0833H21.5836V18.4167H24.4169V24.0833ZM27.9586 27.0583H6.70858V7.08333H27.9586V27.0583ZM27.9586 4.25H6.70858C5.15024 4.25 3.87524 5.525 3.87524 7.08333V26.9167C3.87524 28.475 5.15024 29.75 6.70858 29.75H27.9586C29.5169 29.75 30.7919 28.475 30.7919 26.9167V7.08333C30.7919 5.525 29.5169 4.25 27.9586 4.25Z"
        fill={color}
      />
    </svg>
  );
};

export default StatusIcon;
