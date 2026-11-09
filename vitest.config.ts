import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unit tests only; e2e/ is run by Playwright (`pnpm run test:e2e`).
    include: ["src/**/*.test.ts"],
  },
});
