import { test, expect, type Page } from "@playwright/test";

// Screen sizes from TODO RS-7: phones, tablets, laptops, large desktops and
// two landscape phones.
const VIEWPORTS = [
  { name: "320", width: 320, height: 640 },
  { name: "375", width: 375, height: 740 },
  { name: "414", width: 414, height: 860 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1280", width: 1280, height: 800 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
  { name: "landscape-667", width: 667, height: 375 },
  { name: "landscape-844", width: 844, height: 390 },
];

// A complete, valid answer set: PC, beginner, everyday + gaming, new
// hardware, NVIDIA, balanced updates, KDE Plasma.
const RESULTS_QUERY = "?a=pc,beginner,everyday%2Bgaming,less-than-2,yes,balanced,kde-plasma";

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "page should not scroll sideways").toBeLessThanOrEqual(0);
}

async function dismissConsent(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("analytics-consent", "denied");
    } catch {}
  });
}

for (const vp of VIEWPORTS) {
  for (const theme of ["light", "dark"] as const) {
    test.describe(`${vp.name}px ${theme}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height }, colorScheme: theme });

      test("landing, quiz and results fit the screen", async ({ page }, testInfo) => {
        await dismissConsent(page);

        await page.goto("./");
        await expect(page.getByRole("heading", { level: 1, name: /which linux distro/i })).toBeVisible();
        await expectNoHorizontalScroll(page);
        await page.screenshot({ path: testInfo.outputPath(`landing.png`), fullPage: false });

        await page.getByRole("button", { name: "Start the quiz" }).click();
        await expect(page.getByRole("radiogroup")).toBeVisible();
        await expectNoHorizontalScroll(page);
        // The first option must be reachable without hunting for it.
        await page.getByRole("radio").first().scrollIntoViewIfNeeded();
        await expect(page.getByRole("radio").first()).toBeInViewport();
        await page.screenshot({ path: testInfo.outputPath(`quiz.png`), fullPage: false });

        await page.goto(`./${RESULTS_QUERY}`);
        await expect(page.getByRole("heading", { level: 1, name: /your top linux matches/i })).toBeVisible();
        await expect(page.getByText("Best match")).toBeVisible();
        await expectNoHorizontalScroll(page);
        await page.screenshot({ path: testInfo.outputPath(`results.png`), fullPage: true });
      });
    });
  }
}
