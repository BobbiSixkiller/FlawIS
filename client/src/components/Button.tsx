import { cn } from "@/utils/helpers";
import React, {
  ElementType,
  forwardRef,
  ComponentPropsWithoutRef,
} from "react";

const buttonStyles = {
  base: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  variants: {
    variant: {
      default: "bg-primary-500 text-white hover:bg-primary-500/90",
      destructive: "bg-red-500 text-white hover:bg-red-500/90",
      positive: "bg-green-500 text-white hover:bg-green-500/90",
      outline:
        "border border-primary-500 text-primary-500 hover:border-primary-700 bg-transparent",
      secondary: "bg-black text-white hover:bg-black/80",
      ghost: "hover:bg-white/30",
      link: "text-primary underline-offset-4 hover:underline",
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

export type VariantType = keyof typeof buttonStyles.variants.variant;
type SizeType = keyof typeof buttonStyles.variants.size;

interface ButtonOwnProps {
  variant?: VariantType;
  size?: SizeType;
  className?: string;
}

type ButtonProps<E extends ElementType = "button"> = ButtonOwnProps &
  Omit<ComponentPropsWithoutRef<E>, keyof ButtonOwnProps> & {
    as?: E;
  };

function Button<E extends ElementType = "button">(
  {
    as,
    className,
    variant = buttonStyles.default.variant as VariantType,
    size = buttonStyles.default.size as SizeType,
    ...props
  }: ButtonProps<E>,
  ref: React.Ref<ComponentPropsWithoutRef<E>["ref"]>
) {
  const Component = as || "button"; // Defaults to "button" if no "as" is provided.

  return (
    <Component
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

export default forwardRef(Button) as <E extends ElementType = "button">(
  props: ButtonProps<E> & {
    ref?: React.Ref<ComponentPropsWithoutRef<E>["ref"]>;
  }
) => React.ReactElement | null;
