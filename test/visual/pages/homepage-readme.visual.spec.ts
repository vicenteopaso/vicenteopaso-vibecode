import { expect, test } from "@playwright/test";

import {
  getPortraitMask,
  setThemeDark,
  setThemeLight,
  waitForHomepage,
} from "../utils";

test.describe("Homepage Screenshots for README", () => {
  test("homepage light mode - desktop (masked portrait for README)", async ({
    page,
  }) => {
    await setThemeLight(page);
    await page.goto("/");
    await waitForHomepage(page);

    // Take screenshot with portrait masked (randomly selected) - viewport only (above the fold)
    await expect(page).toHaveScreenshot("homepage-readme-light.png", {
      fullPage: false,
      animations: "disabled",
      timeout: 15000,
      mask: [getPortraitMask(page)],
    });
  });

  test("homepage dark mode - desktop (masked portrait for README)", async ({
    page,
  }) => {
    await setThemeDark(page);
    await page.goto("/");
    await waitForHomepage(page);

    // Take screenshot with portrait masked (randomly selected) - viewport only (above the fold)
    await expect(page).toHaveScreenshot("homepage-readme-dark.png", {
      fullPage: false,
      animations: "disabled",
      timeout: 15000,
      mask: [getPortraitMask(page)],
    });
  });
});
