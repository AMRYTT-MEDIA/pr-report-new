import React from "react";

const LeftArrow = ({ width = 8, height = 12, fill = "#475569" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 8 12" fill={fill}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.08909 0.410582C7.41453 0.736018 7.41453 1.26366 7.08909 1.58909L2.67835 5.99984L7.08909 10.4106C7.41453 10.736 7.41453 11.2637 7.08909 11.5891C6.76366 11.9145 6.23602 11.9145 5.91058 11.5891L0.910582 6.58909C0.585145 6.26366 0.585145 5.73602 0.910582 5.41058L5.91058 0.410582C6.23602 0.0851447 6.76366 0.0851447 7.08909 0.410582Z"
      fill={fill}
    />
  </svg>
);

export default LeftArrow;
