"use client";

import useWidth from "@/hooks/useWidth";
import React, {
  MouseEvent,
  TouchEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  message: string;
  children: React.ReactNode;
  position?: "above" | "below";
}

const Tooltip: React.FC<TooltipProps> = ({
  message,
  children,
  position = "above",
}) => {
  const [visible, setVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({
    top: 0,
    left: 0,
  });
  const width = useWidth();

  const showTooltip = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const top = position === "above" ? rect.top - 40 : rect.bottom + 10;
      const left = rect.left + rect.width / 2;

      setTooltipPosition({
        top,
        left,
      });

      setVisible(true);

      if (width < 1024) {
        setTimeout(() => setVisible(false), 3000);
      }
    },
    [width, position]
  );

  const hideTooltipOnScroll = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    document.addEventListener("scroll", hideTooltipOnScroll, {
      capture: true,
    });

    return () => {
      document.removeEventListener("scroll", hideTooltipOnScroll, {
        capture: true,
      });
    };
  }, [hideTooltipOnScroll]);

  return (
    <div
      className="relative inline-block max-h-5"
      onMouseEnter={showTooltip}
      onMouseLeave={() => setVisible(false)}
      onTouchStart={showTooltip}
    >
      <div className="inline-block">{children}</div>
      {visible &&
        createPortal(
          <div
            className={`fixed ${
              position === "above" ? "mb-2" : "mt-2"
            } transform -translate-x-1/2 w-max p-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg whitespace-pre-line`}
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              zIndex: 9999,
            }}
          >
            {message}
          </div>,
          document.body
        )}
    </div>
  );
};

export default Tooltip;
