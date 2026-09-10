"use client";

import { useMemo, useSyncExternalStore } from "react";

function objectURLResource(file?: Blob | null) {
  let url: string | undefined;
  return {
    subscribe(changed: () => void) {
      if (!file) return () => {};
      url = URL.createObjectURL(file);
      changed();
      return () => {
        if (url) URL.revokeObjectURL(url);
        url = undefined;
      };
    },
    snapshot: () => url,
  };
}
const serverSnapshot = () => undefined;

/** Allocate browser resources only after mounting, and release them on change. */
export function useObjectURL(file?: Blob | null) {
  const resource = useMemo(() => objectURLResource(file), [file]);
  return useSyncExternalStore(
    resource.subscribe,
    resource.snapshot,
    serverSnapshot,
  );
}
