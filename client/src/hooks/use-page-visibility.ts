import { useEffect, useState } from "react";

export function usePageVisibility() {
  const initialVisibility =
    typeof document !== "undefined" ? !document.hidden : true;

  const [isPageVisible, setIsPageVisible] = useState(initialVisibility);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isPageVisible;
}
