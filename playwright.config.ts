import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end and layout checks across the screen sizes listed in TODO RS-7.
 * Runs against the production build served by `astro preview`, so run
 * `pnpm build` first (`pnpm run test:e2e` does both).
 */
const PORT = 4329;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}/distro-chooser/`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `pnpm exec astro preview --port ${PORT}`,
    url: `http://localhost:${PORT}/distro-chooser/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
