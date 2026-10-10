import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padded?: boolean;
  surface?: "ivory" | "white" | "sage" | "forest";
}

const surfaceStyles = {
  ivory: "bg-ivory-100 border-editorial",
  white: "bg-white border-editorial",
  sage:  "bg-sage/50 border border-sage-200",
  forest: "bg-forest text-ivory border border-forest-700",
};

export function Card({ hover, padded = true, surface = "white", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg shadow-editorial",
        surfaceStyles[surface],
        padded && "p-6",
        hover && "card-hover cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between gap-4 mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("font-sans font-semibold text-graphite text-base", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-neutral-500 mt-1", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-3 mt-4 pt-4 border-t border-neutral-100", className)} {...props}>
      {children}
    </div>
  );
}
