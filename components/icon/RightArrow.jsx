import React from "react";

const RightArrow = ({ width = 8, height = 12, fill = "#475569" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 8 12"
      fill={fill}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0.910582 0.410582C1.23602 0.0851447 1.76366 0.0851447 2.08909 0.410582L7.08909 5.41058C7.41453 5.73602 7.41453 6.26366 7.08909 6.58909L2.08909 11.5891C1.76366 11.9145 1.23602 11.9145 0.910582 11.5891C0.585145 11.2637 0.585145 10.736 0.910582 10.4106L5.32133 5.99984L0.910582 1.58909C0.585145 1.26366 0.585145 0.736018 0.910582 0.410582Z"
        fill={fill}
      />
    </svg>
  );
};

export default RightArrow;
