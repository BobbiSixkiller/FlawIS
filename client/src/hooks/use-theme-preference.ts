"use client";

import { createContext, useContext } from "react";
import type { ThemePreference } from "@/lib/theme";

type ThemeContextValue = {
  preference: ThemePreference;
  pending: boolean;
  setPreference: (preference: ThemePreference) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemePreference() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemePreference must be used within ThemeProvider");
  }

  return context;
}
