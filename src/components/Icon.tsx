"use client";

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
  style?: React.CSSProperties;
}

export default function Icon({ name, className = "", filled = false, style }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? "fill-icon" : ""} ${className}`}
      style={style}
    >
      {name}
    </span>
  );
}