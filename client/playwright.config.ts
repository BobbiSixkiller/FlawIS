import { defineConfig } from "@playwright/test";
import { authFile, baseURL } from "./e2e/environment.mjs";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  globalTimeout: 10 * 60_000,
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  outputDir: "test-results",
  use: {
    baseURL,
    browserName: "chromium",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "public", testMatch: /login\.spec\.ts/ },
    { name: "session", testMatch: /auth\.setup\.ts/ },
    ...["en", "sk"].flatMap((language) =>
      ["desktop", "mobile"].map((size) => ({
        name: `${size}-${language}`,
        testMatch: /workflows\.spec\.ts/,
        dependencies: ["session"],
        metadata: { language },
        use: {
          storageState: authFile,
          viewport:
            size === "desktop"
              ? { width: 1440, height: 1000 }
              : { width: 390, height: 844 },
          colorScheme:
            size === "desktop" ? ("light" as const) : ("dark" as const),
        },
      })),
    ),
  ],
});
