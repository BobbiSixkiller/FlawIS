"use client";

import useWidth from "@/hooks/useWidth";
import { useDialog } from "@/providers/DialogProvider";
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
  const width = useWidth();
  const { someDialogOpen } = useDialog();

  const showTooltip = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (someDialogOpen) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const top = position === "above" ? rect.top - 40 : rect.bottom + 10;
      const left = rect.left + rect.width / 2;

      setTooltipPosition({
        top,
        left: left + 10,
      });
      setVisible(true);
    },
    [position, someDialogOpen]
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
    if (visible && ref.current) {
      const rect = ref.current.getBoundingClientRect();

      if (rect.right > width) {
        return setTooltipPosition((prev) => ({
          ...prev,
          left: prev.left - (rect.right - width + 6),
        }));
      }

      if (rect.left < 0) {
        return setTooltipPosition((prev) => ({
          ...prev,
          left: prev.left + (Math.abs(rect.left) + 6),
        }));
      }

      return setTooltipPosition((prev) => ({ ...prev, left: prev.left - 10 }));
    }
  }, [visible, ref, width]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={() => {
        setVisible(false);
      }}
      onTouchStart={showTooltip}
      onTouchEnd={() => setTimeout(() => setVisible(false), 2000)}
      onClick={() => setVisible(false)}
    >
      <div className="inline-block">{children}</div>

      {visible &&
        createPortal(
          <div
            ref={ref}
            className={cn([
              "fixed z-10  transform -translate-x-1/2 transition-all ease-out duration-300 w-max p-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg whitespace-pre-line",
              position === "above" ? "mb-2" : "mt-2",
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
