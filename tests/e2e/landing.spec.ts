import { test, expect } from "@playwright/test";
import { LandingPage } from "./landing-page";

test.describe("Landing Page", () => {
  test("page loads with correct title",
    { tag: ["@critical", "@e2e", "@landing"] },
    async ({ page }) => {
      const landing = new LandingPage(page);
      await landing.goto();
      await landing.verifyTitle();
    },
  );

  test("navigation links are visible",
    { tag: ["@critical", "@e2e", "@landing"] },
    async ({ page }) => {
      const landing = new LandingPage(page);
      await landing.goto();
      await landing.verifyNavLinks();
    },
  );

  test("hero section exists",
    { tag: ["@e2e", "@landing"] },
    async ({ page }) => {
      const landing = new LandingPage(page);
      await landing.goto();
      await expect(landing.heroSection).toBeVisible();
    },
  );
});
