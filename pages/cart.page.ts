import { type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartLink: Locator;
  readonly items: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.title');
    this.cartLink = page.locator('.shopping_cart_link');
    this.items = page.locator('.cart_item');
    this.continueShoppingButton = page.getByRole('button', {
      name: 'Continue Shopping',
      exact: true,
    });
    this.checkoutButton = page.getByRole('button', {
      name: 'Checkout',
      exact: true,
    });
  }

  item(name: string): Locator {
    return this.items.filter({
      has: this.page.getByText(name, { exact: true }),
    });
  }

  async open() {
    await this.cartLink.click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async startCheckout() {
    await this.checkoutButton.click();
  }
}