import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "green" | "orange" | "lavender";
  arrow?: boolean;
  arrowPosition?: "right" | "left";
}

export default function Button({
                                 children,
                                 variant = "green",
                                 arrow = false,
                                 arrowPosition = "right",
                                 type = "button",
                                 ...props
                               }: ButtonProps) {
  const baseClasses =
    "group flex items-center justify-center gap-1.5 text-white text-xs sm:text-sm font-medium py-2 px-5 rounded-full transition-all duration-300 cursor-pointer backdrop-blur-md border border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95";

  const colorClasses =
    variant === "green"
      ? "bg-[rgba(137,126,69,0.3)] hover:bg-[rgba(137,126,69,0.45)]"
      : variant === "orange"
        ? "bg-[rgba(239,149,95,0.3)] hover:bg-[rgba(239,149,95,0.45)]"
        : "bg-[rgba(173,163,177,0.3)] hover:bg-[rgba(173,163,177,0.45)]";

  const ArrowIcon = () => (
    <svg
      className={`w-4 h-4 transition-transform duration-300 ${
        arrowPosition === "right"
          ? "group-hover:translate-x-1"
          : "group-hover:-translate-x-1 rotate-180"
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 8l4 4m0 0l-4 4m4-4H3"
      />
    </svg>
  );

  return (
    <button
      type={type}
      {...props}
      className={`${baseClasses} ${colorClasses}`}
      style={{
        color: "var(--white, #fafafa)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      }}
    >
      {arrow && arrowPosition === "left" && <ArrowIcon />}
      {children}
      {arrow && arrowPosition === "right" && <ArrowIcon />}
    </button>
  );
}
