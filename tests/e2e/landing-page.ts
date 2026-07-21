import { Page, Locator, expect } from "@playwright/test";

export class LandingPage {
  readonly page: Page;
  readonly navLinks: Locator;
  readonly heroSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navLinks = page.getByRole("link");
    this.heroSection = page.locator("section").first();
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
  }

  async verifyTitle(): Promise<void> {
    await expect(this.page).toHaveTitle(/Café Mi Tierra/i);
  }

  async verifyNavLinks(): Promise<void> {
    const links = ["Nosotros", "Servicios", "Horarios", "Galería", "Contacto"];
    const nav = this.page.getByRole("navigation");
    for (const link of links) {
      await expect(nav.getByRole("link", { name: link })).toBeVisible();
    }
  }

  async clickNavLink(name: string): Promise<void> {
    await this.page.getByRole("link", { name }).click();
  }
}
