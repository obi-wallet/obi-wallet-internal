// eslint-disable-next-line import/no-extraneous-dependencies
import { test, expect } from "@playwright/test";

test("Next.js tests pass", async ({ page }) => {
  await page.goto("/tests");

  const element = await page.waitForSelector("#test-results", {
    state: "attached",
  });
  expect(await element.textContent()).toEqual("success");
});
