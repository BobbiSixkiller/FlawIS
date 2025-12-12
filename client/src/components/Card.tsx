import { cn } from "@/utils/helpers";
import { ComponentPropsWithoutRef, ElementType, forwardRef } from "react";

interface CardOwnProps {
  className?: string;
}

export type CardProps<E extends ElementType = "div"> = CardOwnProps &
  Omit<ComponentPropsWithoutRef<E>, keyof CardOwnProps> & {
    as?: E;
  };

function Card<E extends ElementType = "div">(
  { as, className, ...props }: CardProps<E>,
  ref: React.Ref<ComponentPropsWithoutRef<E>["ref"]>
) {
  const Component = as || "div"; // Defaults to "div" if no "as" is provided.

  return (
    <Component
      className={cn(
        "relative rounded-2xl border dark:border-none shadow hover:shadow-lg p-4 text-gray-900 text-sm cursor-pointer outline-none focus:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-2 bg-white",
        "dark:bg-gray-800 dark:text-white/85 dark:focus:ring-primary-300 dark:focus-visible:ring-offset-gray-950",
        className
      )}
      ref={ref}
      {...props}
    />
  );
}

export default forwardRef(Card) as <E extends ElementType = "div">(
  props: CardProps<E> & {
    ref?: React.Ref<ComponentPropsWithoutRef<E>["ref"]>;
  }
) => React.ReactElement | null;
