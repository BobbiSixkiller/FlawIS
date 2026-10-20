"use client";

import { useEffect, useId } from "react";
import { useParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { ResourceLabel, useBreadcrumbStore } from "@/stores/breadcrumbStore";

// Server pages publish names from data they already fetched. Registrations are
// scoped to the locale, route parameter, and resource value, and removed on unmount.
export function BreadcrumbLabel({
  param,
  value,
  path,
  label,
}: Omit<ResourceLabel, "lng">) {
  const { lng } = useParams<{ lng: string }>();
  const register = useBreadcrumbStore((state) => state.registerLabel);
  const id = useId();

  useEffect(() => {
    if (!label.trim()) return;
    return register(id, { param, value, path, label, lng });
  }, [register, id, param, value, path, label, lng]);

  return null;
}

export function useBreadcrumbLabels(
  segments: string[],
  params: { lng: string } & Record<string, string | string[]>,
) {
  return useBreadcrumbStore(useShallow((state) => {
    const labels: (string | undefined)[] = new Array(segments.length).fill(undefined);
    const prefixes = segments.map((_, index) =>
      `/${segments.slice(0, index + 1).join("/")}`,
    );

    for (const entry of Object.values(state.registrations)) {
      if (entry.lng !== params.lng || params[entry.param] !== entry.value) continue;
      // A subdomain rewrite may hide leading route segments. Match the longest
      // visible prefix against the canonical resource path, including its ID.
      const index = prefixes.findLastIndex((prefix) => entry.path.endsWith(prefix));
      if (index !== -1) labels[index] = entry.label;
    }

    // Compare the displayed strings so registrations for other routes, and
    // equivalent names from overlapping pages/modals, do not trigger renders.
    return labels;
  }));
}
