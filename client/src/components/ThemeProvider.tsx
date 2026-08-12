"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { themePreferenceUsesDark, ThemePreference } from "@/lib/theme";
import { setThemePreferenceCookie } from "@/lib/themeAction";

const systemDarkQuery = "(prefers-color-scheme: dark)";

type ThemeContextValue = {
  preference: ThemePreference;
  pending: boolean;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(preference: ThemePreference) {
  const dark = themePreferenceUsesDark(
    preference,
    window.matchMedia(systemDarkQuery).matches,
  );

  document.documentElement.classList.toggle("dark", dark);
}

export default function ThemeProvider({
  children,
  initialPreference,
}: {
  children: ReactNode;
  initialPreference: ThemePreference;
}) {
  const [preference, setPreferenceState] = useState(initialPreference);
  const [pending, startTransition] = useTransition();
  const preferenceRef = useRef(initialPreference);
  const confirmedPreferenceRef = useRef(initialPreference);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const mediaQuery = window.matchMedia(systemDarkQuery);
    const syncSystemTheme = () => applyTheme("system");

    applyTheme(preference);

    if (preference !== "system") return;

    mediaQuery.addEventListener("change", syncSystemTheme);
    return () => mediaQuery.removeEventListener("change", syncSystemTheme);
  }, [preference]);

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    if (nextPreference === preferenceRef.current) return;

    preferenceRef.current = nextPreference;
    setPreferenceState(nextPreference);
    applyTheme(nextPreference);

    startTransition(async () => {
      const saveRequest = saveQueueRef.current.then(() =>
        setThemePreferenceCookie(nextPreference),
      );
      saveQueueRef.current = saveRequest.catch(() => undefined);

      try {
        await saveRequest;
        confirmedPreferenceRef.current = nextPreference;

        if (preferenceRef.current === nextPreference) {
          applyTheme(nextPreference);
        }
      } catch (error) {
        if (preferenceRef.current === nextPreference) {
          const confirmedPreference = confirmedPreferenceRef.current;
          preferenceRef.current = confirmedPreference;
          setPreferenceState(confirmedPreference);
          applyTheme(confirmedPreference);
        }

        console.error("Could not save the theme preference", error);
      }
    });
  }, []);

  const value = useMemo(
    () => ({ preference, pending, setPreference }),
    [pending, preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemePreference() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemePreference must be used within ThemeProvider");
  }

  return context;
}
