import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm";

const variants: Record<Variant, string> = {
  primary:
    "bg-white text-zinc-950 font-bold hover:bg-zinc-200 border border-white shadow-sm transition-colors",
  secondary: "bg-elevated text-zinc-100 hover:bg-line border border-white/10",
  ghost: "text-zinc-300 hover:text-white hover:bg-white/5",
  outline: "border border-line text-zinc-200 hover:border-white hover:text-white hover:bg-white/5",
  danger: "bg-st-dropped/10 text-st-dropped border border-st-dropped/20 hover:bg-st-dropped/20",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2",
  icon: "h-10 w-10 rounded-xl",
  "icon-sm": "h-8 w-8 rounded-lg",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "secondary", size = "md", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});

export function buttonClasses(variant: Variant = "secondary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-all duration-200 active:scale-[0.97]",
    variants[variant],
    sizes[size],
    className,
  );
}
