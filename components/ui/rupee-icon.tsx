import React from "react";
import { LucideProps } from "lucide-react";

export const RupeeIcon: React.FC<LucideProps> = ({
  size = 24,
  strokeWidth = 2,
  color = "currentColor",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="M6 13l8.5 8" />
      <path d="M15 13c-2.5 0-5-2.5-5-5 0 0 0 0 0 0h5" />
    </svg>
  );
}; 