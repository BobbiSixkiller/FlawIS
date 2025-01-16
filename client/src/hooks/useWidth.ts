import { useEffect, useState } from "react";

export default function useWidth() {
  const [width, setWidth] = useState(0); // default width, detect on server.

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => setWidth(window.innerWidth);

      window.addEventListener("resize", handleResize);

      handleResize();

      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return width;
}
