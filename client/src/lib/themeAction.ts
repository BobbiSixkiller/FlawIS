"use server";

import { cookies } from "next/headers";

import {
  getThemeCookieValue,
  isThemePreference,
  themeCookieName,
  ThemePreference,
} from "@/lib/theme";

export async function setThemePreferenceCookie(value: ThemePreference) {
  if (!isThemePreference(value)) {
    throw new Error("Invalid theme preference");
  }

  const cookieStore = await cookies();
  const cookieValue = getThemeCookieValue(value);
  const cookieOptions = {
    sameSite: "lax" as const,
    path: "/",
    domain:
      process.env.NODE_ENV === "development" ? "localhost" : ".flaw.uniba.sk",
  };

  if (!cookieValue) {
    cookieStore.delete({
      name: themeCookieName,
      ...cookieOptions,
    });
    return;
  }

  cookieStore.set(themeCookieName, cookieValue, {
    ...cookieOptions,
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });
}
