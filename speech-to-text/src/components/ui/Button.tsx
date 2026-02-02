import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "error" | "confirm";
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", className, children, ...props },
    ref,
  ) => {
    const baseStyles =
      "flex items-center justify-center rounded-lg border-none cursor-pointer transition-all duration-150 ease-out flex-shrink-0 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed";

    const variantStyles = {
      primary: "bg-brand-primary text-white hover:bg-brand-primary-dark",
      secondary:
        "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
      error: "bg-error-bg text-error hover:bg-error-light",
      confirm: "bg-brand-primary text-white hover:bg-brand-primary-dark",
    };

    const sizeStyles = {
      sm: "w-[34px] h-[34px]",
      md: "w-9 h-9",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
