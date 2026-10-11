import { type Locator, type Page } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.title');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
  }

  productCard(name: string): Locator {
    return this.page.locator('.inventory_item').filter({
      has: this.page.getByText(name, { exact: true }),
    });
  }

  async addProduct(name: string) {
    await this.productCard(name)
      .getByRole('button', { name: 'Add to cart', exact: true })
      .click();
  }

  async openCart() {
    await this.cartLink.click();
  }
}