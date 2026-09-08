import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextCoreWebVitals,
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/Icon.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@heroicons/react", "@heroicons/react/**"],
              message: "Use Icon from @/components/Icon so the icon provider stays centralized.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/lib/graphql/generated/**",
  ]),
]);
