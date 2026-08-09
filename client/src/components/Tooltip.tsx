"use client";

import useWidth from "@/hooks/useWidth";
import { useDialogStore } from "@/stores/dialogStore";
import { cn } from "@/lib/clientUtils";
import React, {
  MouseEvent,
  TouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  message: string;
  children: React.ReactNode;
  position?: "above" | "below";
}

export default function Tooltip({
  message,
  children,
  position = "above",
}: TooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({
    top: 0,
    left: 0,
  });
  const viewportWidth = useWidth();

  const anyDialogOpen = useDialogStore((s) =>
    Object.values(s.openDialogs).some((val) => val),
  );

  const showTooltip = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (anyDialogOpen) return;
      const rect = e.currentTarget.getBoundingClientRect();

      const top = position === "above" ? rect.top - 40 : rect.bottom;
      const left = rect.left + rect.width / 2;

      setTooltipPosition((prev) => ({ ...prev, top, left: left + 10 }));
      setVisible(true);
    },
    [position, anyDialogOpen],
  );

  const hideTooltipOnScroll = useCallback(() => setVisible(false), []);

  useEffect(() => {
    document.addEventListener("scroll", hideTooltipOnScroll, { capture: true });
    return () => {
      document.removeEventListener("scroll", hideTooltipOnScroll, {
        capture: true,
      });
    };
  }, [hideTooltipOnScroll]);

  useEffect(() => {
    if (!visible || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const margin = 14; // small margin from edges
    const overflowRight = rect.right > viewportWidth;
    const overflowLeft = rect.left < 0;

    setTooltipPosition((prev) => ({
      ...prev,
      top:
        rect.height > 40 && position === "above"
          ? prev.top - (rect.height - 40 + 4)
          : prev.top,
      left: overflowRight
        ? prev.left - (rect.right - viewportWidth + margin)
        : overflowLeft
          ? prev.left + Math.abs(rect.left) + margin
          : prev.left - 10,
    }));
  }, [position, viewportWidth, visible]);

  return (
    <div
      className="relative h-fit w-fit"
      onMouseEnter={showTooltip}
      onMouseLeave={() => {
        setVisible(false);
      }}
      onTouchStart={showTooltip}
      onTouchEnd={() => setTimeout(() => setVisible(false), 2000)}
      onClick={() => setVisible(false)}
    >
      {children}

      {visible &&
        createPortal(
          <div
            ref={ref}
            className={cn([
              position === "above" ? "mb-1" : "mt-1",
              "fixed z-9999 transform -translate-x-1/2 transition-all ease-out duration-300 w-max p-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg whitespace-pre-wrap wrap-break-word max-w-[calc(100vw-28px)]",
            ])}
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
            }}
          >
            {message}
          </div>,
          document.body,
        )}
    </div>
  );
}
