import { cn } from "@/utils/helpers";
import * as React from "react";

//refactor styles using my pallete
const buttonStyles = {
  base: cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  ),
  variants: {
    variant: {
      default: cn("bg-primary-500 text-white hover:bg-primary-500/90"),
      destructive: cn("bg-red-500 text-white hover:bg-red-500/90"),
      outline: cn(
        "border border-primary-500 text-primary-500 hover:border-primary-700 bg-transparent"
      ),
      secondary: cn("bg-black text-white hover:bg-black/80"),
      ghost: cn("hover:bg-white/30"),
      link: cn("text-primary underline-offset-4 hover:underline"),
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    },
  },
  default: {
    variant: "default",
    size: "default",
  },
};

type VariantType = keyof typeof buttonStyles.variants.variant;
type SizeType = keyof typeof buttonStyles.variants.size;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: VariantType;
  size?: SizeType;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = buttonStyles.default.variant,
      size = buttonStyles.default.size,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          buttonStyles.base,
          buttonStyles.variants.variant[variant as VariantType],
          buttonStyles.variants.size[size as SizeType],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
