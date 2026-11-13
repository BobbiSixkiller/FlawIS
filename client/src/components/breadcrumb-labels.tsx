"use client";

import { useEffect, useId } from "react";
import { useParams } from "next/navigation";
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
