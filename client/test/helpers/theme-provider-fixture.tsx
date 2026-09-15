import ThemeProvider from "../../src/components/ThemeProvider";
import type { ThemePreference } from "../../src/lib/theme";

export function ThemeProviderFixture({
  initialPreference,
}: {
  initialPreference: ThemePreference;
}) {
  return (
    <ThemeProvider initialPreference={initialPreference}>Page</ThemeProvider>
  );
}
