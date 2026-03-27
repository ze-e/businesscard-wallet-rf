import { test, expect } from "@playwright/test";

test("capture page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Capture Business Card")).toBeVisible();
});