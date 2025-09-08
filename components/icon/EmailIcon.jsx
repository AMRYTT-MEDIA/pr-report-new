import React from "react";

const EmailIcon = ({ width = "17", height = "14", color = "#475569" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 17 14"
      fill="none"
    >
      <path
        d="M16.8334 1.99992C16.8334 1.08325 16.0834 0.333252 15.1667 0.333252H1.83335C0.916687 0.333252 0.166687 1.08325 0.166687 1.99992V11.9999C0.166687 12.9166 0.916687 13.6666 1.83335 13.6666H15.1667C16.0834 13.6666 16.8334 12.9166 16.8334 11.9999V1.99992ZM15.1667 1.99992L8.50002 6.15825L1.83335 1.99992H15.1667ZM15.1667 11.9999H1.83335V3.66659L8.50002 7.83325L15.1667 3.66659V11.9999Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};

export default EmailIcon;
