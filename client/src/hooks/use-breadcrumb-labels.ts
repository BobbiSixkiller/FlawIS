"use client";

import { useShallow } from "zustand/react/shallow";
import { useBreadcrumbStore } from "@/stores/breadcrumbStore";

/** Subscribes only to labels visible in the current localized route. */
export function useBreadcrumbLabels(
  segments: string[],
  params: { lng: string } & Record<string, string | string[]>,
) {
  return useBreadcrumbStore(
    useShallow((state) => {
      const labels: (string | undefined)[] = new Array(segments.length).fill(
        undefined,
      );
      const prefixes = segments.map(
        (_, index) => `/${segments.slice(0, index + 1).join("/")}`,
      );

      for (const entry of Object.values(state.registrations)) {
        if (entry.lng !== params.lng || params[entry.param] !== entry.value)
          continue;
        // A subdomain rewrite may hide leading route segments. Match the longest
        // visible prefix against the canonical resource path, including its ID.
        const index = prefixes.findLastIndex((prefix) =>
          entry.path.endsWith(prefix),
        );
        if (index !== -1) labels[index] = entry.label;
      }

      // Compare the displayed strings so registrations for other routes, and
      // equivalent names from overlapping pages/modals, do not trigger renders.
      return labels;
    }),
  );
}
