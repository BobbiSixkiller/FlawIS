"use client";

import { fetchFromMinio } from "@/lib/utilsClient";
import { useEffect, useRef, useState } from "react";

export type FileSources = Record<string, string | string[] | null | undefined>;

/** Undefined means uninitialized. Empty arrays/null are deliberate user choices. */
export function useFileSource<T>({
  value,
  sources,
  onLoad,
  onError,
  convert,
}: {
  value: T | undefined;
  sources?: FileSources;
  onLoad: (files: T) => void;
  onError?: (message: string) => void;
  convert: (files: File[]) => T;
}) {
  const [failedSource, setFailedSource] = useState<string>();
  const latest = useRef({ value, onLoad, onError, convert });
  useEffect(() => {
    latest.current = { value, onLoad, onError, convert };
  });
  const serialized = JSON.stringify(sources ?? {});
  const hasSources = Object.values(sources ?? {}).some((urls) =>
    Array.isArray(urls) ? urls.length > 0 : Boolean(urls),
  );
  useEffect(() => {
    if (value !== undefined) return;
    let cancelled = false;
    const entries = Object.entries(
      JSON.parse(serialized) as FileSources,
    ).flatMap(([bucket, urls]) =>
      (Array.isArray(urls) ? urls : urls ? [urls] : []).map((url) => ({
        bucket,
        url,
      })),
    );
    void Promise.all(
      entries.map(({ bucket, url }) => fetchFromMinio(bucket, url)),
    )
      .then((files) => {
        if (!cancelled && latest.current.value === undefined)
          latest.current.onLoad(latest.current.convert(files));
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setFailedSource(serialized);
          latest.current.onError?.(
            error instanceof Error ? error.message : "Failed to load files",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [serialized, value]);
  return value === undefined && hasSources && failedSource !== serialized;
}
