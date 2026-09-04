import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

import { getMe } from "@/app/[lng]/(auth)/actions";

export const getOptionalViewer = cache(async () => {
  const cookieStore = await cookies();

  if (!cookieStore.has("accessToken")) {
    return null;
  }

  try {
    return (await getMe()) ?? null;
  } catch {
    return null;
  }
});
