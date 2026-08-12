export const themeCookieName = "theme";

export const themePreferences = ["light", "system", "dark"] as const;

export type ThemePreference = (typeof themePreferences)[number];

export function isThemePreference(value: unknown): value is ThemePreference {
  return (
    value === "light" ||
    value === "system" ||
    value === "dark"
  );
}

export function getThemePreference(value: unknown): ThemePreference {
  return isThemePreference(value) ? value : "system";
}

export function getThemeCookieValue(
  preference: ThemePreference,
): "light" | "dark" | undefined {
  return preference === "system" ? undefined : preference;
}

export function themePreferenceUsesDark(
  preference: ThemePreference,
  systemUsesDark: boolean,
) {
  return (
    preference === "dark" ||
    (preference === "system" && systemUsesDark)
  );
}

export const systemThemeScript = `document.documentElement.classList.toggle("dark",window.matchMedia("(prefers-color-scheme: dark)").matches);`;
