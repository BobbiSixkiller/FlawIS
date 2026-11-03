"use client";
import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { overlayPosition, type OverlayAnchor } from "./overlay-position";
export type DropdownItem = ReactElement;
interface DropdownProps {
  trigger: ReactNode;
  triggerProps?: ButtonProps;
  items: DropdownItem[];
  anchor?: OverlayAnchor;
  buttonWidth?: boolean;
}
function Item({ item }: { item: DropdownItem }) {
  // Resolve streamed Server Component children only once the menu opens.
  const resolved = Children.toArray(item)[0];
  if (
    !isValidElement<{
      href?: string;
      nativeButton?: boolean;
      role?: string;
    }>(resolved)
  )
    return null;
  const props = resolved.props;
  const nativeButton =
    props.nativeButton ??
    (resolved.type === "button" ||
      (typeof resolved.type !== "string" && !props.href));
  return (
    <DropdownMenuItem
      nativeButton={nativeButton}
      render={cloneElement(resolved, { role: "menuitem" })}
      className="min-h-11 w-full justify-start gap-2 px-3 py-2 text-sm"
    />
  );
}
export default function Dropdown({
  trigger,
  triggerProps,
  items,
  anchor = "bottom end",
  buttonWidth,
}: DropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button {...triggerProps} />}>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        {...overlayPosition(anchor)}
        className={cn("min-w-44", buttonWidth ? "w-(--anchor-width)" : "w-max")}
      >
        {items.map((item, index) => (
          <Item key={item.key ?? index} item={item} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
