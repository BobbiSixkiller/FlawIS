"use client";

import useWidth from "@/hooks/useWidth";
import { useDialogStore } from "@/stores/dialogStore";
import { cn } from "@/utils/helpers";
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

  const { openDialogs } = useDialogStore();

  const showTooltip = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (Object.values(openDialogs).some((val) => val)) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const top = position === "above" ? rect.top - 40 : rect.bottom;
      const left = rect.left + rect.width / 2;

      setTooltipPosition((prev) => ({ ...prev, top, left: left + 10 }));
      setVisible(true);
    },
    [position, openDialogs]
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
    const margin = 14; // small padding from edges
    const overflowRight = rect.right > viewportWidth;
    const overflowLeft = rect.left < 0;

    let newLeft = tooltipPosition.left;

    if (overflowRight) {
      newLeft -= rect.right - viewportWidth + margin;
    } else if (overflowLeft) {
      newLeft += Math.abs(rect.left) + margin;
    } else {
      newLeft -= 10;
    }

    setTooltipPosition((prev) => ({
      ...prev,
      left: newLeft,
    }));
  }, [visible, ref, viewportWidth]);

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
              "absolute z-10 transform -translate-x-1/2 transition-all ease-out duration-300 w-max p-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg whitespace-pre-wrap break-words max-w-[calc(100vw-28px)]",
            ])}
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
            }}
          >
            {message}
          </div>,
          document.body
        )}
    </div>
  );
}
