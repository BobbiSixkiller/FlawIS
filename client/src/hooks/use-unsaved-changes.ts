"use client";

import { useEffect } from "react";
import { localizedText as tr } from "@/lib/i18n/text";

/** Guards document navigation and tab closure while the caller has an unsaved draft. */
export function useUnsavedChanges(dirty: boolean, lng = "sk") {
  useEffect(() => {
    if (!dirty) return;
    const listener = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", listener);
    const navigate = (e: MouseEvent) => {
      const link = (e.target as Element).closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (
        !link ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        link.href === window.location.href ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      if (
        !window.confirm(
          tr(lng)(
            "Odísť a zahodiť neuložené zmeny?",
            "Leave and discard unsaved changes?",
          ),
        )
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", listener);
      document.removeEventListener("click", navigate, true);
    };
  }, [dirty, lng]);
}
