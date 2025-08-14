import React from "react";

const TotalPublicationIcon = ({
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
      viewBox="0 0 35 34"
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M26.6767 12.75L27.5267 17H7.80675L8.65675 12.75H26.6767ZM29.0001 5.66663H6.33341V8.49996H29.0001V5.66663ZM29.0001 9.91663H6.33341L4.91675 17V19.8333H6.33341V28.3333H20.5001V19.8333H26.1667V28.3333H29.0001V19.8333H30.4167V17L29.0001 9.91663ZM9.16675 25.5V19.8333H17.6667V25.5H9.16675Z"
        fill={color}
      />
    </svg>
  );
};

export default TotalPublicationIcon;
