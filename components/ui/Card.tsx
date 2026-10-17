import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padded?: boolean;
  surface?: "default" | "subtle" | "elevated" | "accent";
}

const surfaceStyles = {
  default:  "bg-[#161616] border border-[#222222]",
  subtle:   "bg-[#1E1E1E] border border-[#262626]",
  elevated: "bg-[#1C1C1E] border border-[#2A2A2A] shadow-[0_4px_24px_rgba(0,0,0,0.35)]",
  accent:   "bg-[#111A13] border border-[#2BD64F]/20",
};

export function Card({
  hover = false,
  padded = true,
  surface = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-[24px]",
        surfaceStyles[surface],
        padded ? "p-6" : "",
        hover ? "cursor-pointer transition-all duration-200 hover:border-[#333333] hover:shadow-[0_4px_24px_rgba(0,0,0,0.35)]" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["flex items-center justify-between gap-4 mb-4", className].join(" ")} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={["font-bold text-white text-sm tracking-tight", className].join(" ")} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = "", children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={["text-xs text-[#A3A3A3] mt-1 leading-relaxed", className].join(" ")} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["flex items-center gap-3 mt-4 pt-4 border-t border-[#222222]", className].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
