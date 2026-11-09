import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("analytics-consent", "denied");
    } catch {}
  });
});

test("completes the quiz and shows shareable results", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Start the quiz" }).click();

  await page.getByRole("radio", { name: /^PC or laptop/ }).click();
  await page.getByRole("radio", { name: /^Beginner/ }).click();
  await page.getByRole("checkbox", { name: /Everyday computing/ }).click();
  await page.getByRole("checkbox", { name: /^Gaming/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: /Less than 2 years/ }).click();
  await page.getByRole("radio", { name: /^Yes/ }).click();
  await page.getByRole("radio", { name: /Somewhere in between/ }).click();
  await page.getByRole("radio", { name: /^KDE Plasma/ }).click();

  await expect(page.getByRole("heading", { level: 1, name: /your top linux matches/i })).toBeVisible();
  await expect(page).toHaveURL(/\?a=pc,beginner,everyday%2Bgaming/);
  await expect(page.getByText("Best match")).toBeVisible();
});

test("progress starts at 0% on the first question", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 });
  await page.goto("./");
  await page.getByRole("button", { name: "Start the quiz" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
});

test("old six-answer links still open, treated as a PC", async ({ page }) => {
  await page.goto("./?a=beginner,everyday,10-plus,no,stable,no-preference");
  await expect(page.getByRole("heading", { level: 1, name: /your top linux matches/i })).toBeVisible();
  await expect(page.locator("section[aria-labelledby=results-heading]").getByText("Raspberry Pi OS")).toHaveCount(0);
});

test("broken links show a friendly message instead of a blank page", async ({ page }) => {
  await page.goto("./?a=nonsense");
  await expect(page.getByRole("status")).toContainText("out of date");
  await expect(page.getByRole("button", { name: "Start the quiz" })).toBeVisible();
});

test("header start-over returns to the landing screen", async ({ page }) => {
  await page.goto("./?a=pc,beginner,everyday,less-than-2,no,stable,gnome");
  await page.locator("#header-start-over").click();
  await expect(page.getByRole("heading", { level: 1, name: /which linux distro/i })).toBeVisible();
  await expect(page).not.toHaveURL(/\?a=/);
});

test("analytics stay off until consent is given", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("./");
  await expect(page.getByRole("region", { name: "Cookie consent" })).toBeVisible();
  await page.waitForTimeout(500);
  expect(requests.some((u) => u.includes("googletagmanager") || u.includes("ahrefs"))).toBe(false);
  await context.close();
});

test("theme toggle switches and remembers dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("./");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});
