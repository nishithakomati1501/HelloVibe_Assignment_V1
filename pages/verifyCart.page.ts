import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
  }

  async continueShopping(): Promise<void> {
    await this.page
      .locator('[data-test="continue-shopping"]')
      .click();
  }

  async checkout(): Promise<void> {
    await this.page
      .locator('[data-test="checkout"]')
      .click();
  }
}