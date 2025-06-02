import { cn } from "@/utils/helpers";
import React, {
  ElementType,
  forwardRef,
  ComponentPropsWithoutRef,
} from "react";

const buttonStyles = {
  base: "inline-flex gap-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 disabled:pointer-events-none disabled:opacity-50",
  variants: {
    variant: {
      default:
        "bg-primary-500 text-white hover:bg-primary-500/90 dark:bg-primary-300 dark:hover:bg-primary-300/90 dark:text-gray-900 dark:focus:ring-primary-300",
      destructive:
        "bg-red-500 text-white hover:bg-red-500/90 focus-visible:ring-red-500",
      positive:
        "bg-green-500 text-white hover:bg-green-500/90 focus-visible:ring-green-500",
      outline:
        "border border-primary-500 text-primary-500 hover:border-primary-700 bg-transparent",
      secondary:
        "border text-gray-900 dark:text-white/85 dark:bg-gray-700 dark:border-none shadow",
      ghost:
        "text-gray-900 hover:bg-black/20 bg-transparent dark:text-white/85 dark:hover:bg-white/20",
      link: "text-primary-500 underline-offset-4 hover:underline",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-9 w-9",
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

export type ButtonProps<E extends ElementType = "button"> = ButtonOwnProps &
  Omit<ComponentPropsWithoutRef<E>, keyof ButtonOwnProps> & {
    as?: E;
  };

function Button<E extends ElementType = "button">(
  {
    as,
    className,
    variant = buttonStyles.default.variant as VariantType,
    size = buttonStyles.default.size as SizeType,
    type,
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
      type={type || "button"}
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
