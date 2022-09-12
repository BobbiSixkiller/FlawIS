import { useRef } from "react";

export default function useScroll() {
  const ref = useRef(null);

  function scrollToRef() {
    ref.current.scrollIntoView();
  }

  return { ref, scrollToRef };
}
