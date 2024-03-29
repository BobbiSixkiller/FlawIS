import { RefObject, useEffect, useState } from "react";

type Event = MouseEvent | TouchEvent;

export default function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void
) {
  const [click, setClick] = useState(false);
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref?.current;
      if (!el || el.contains((event?.target as Node) || null)) {
        return setClick(false);
      }

      handler(event); // Call the handler only if the click is outside of the element passed.
      setClick(true);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]); // Reload only if ref or handler changes

  return click;
}
