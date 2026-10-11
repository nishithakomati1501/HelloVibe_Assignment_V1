import { expect } from '@playwright/test';
import { bookingData } from '../../data/booking-data';
import { selectedProducts } from '../../data/products';
import { users } from '../../data/users';
import { test } from '../fixtures';

test('standard user can enter valid checkout information', async ({
  loginPage,
  inventoryPage,
  cartPage,
  checkoutPage,
}) => {
  const customer = bookingData[0];
  const product = selectedProducts[0];

  if (!customer || !product) {
    throw new Error('Checkout customer information or product data is missing');
  }

  await loginPage.open();
  await loginPage.login(users.standard);
  await expect(inventoryPage.title).toHaveText('Products');

  await inventoryPage.addProduct(product.name);
  await expect(inventoryPage.cartBadge).toHaveText('1');

  await cartPage.open();
  await expect(cartPage.title).toHaveText('Your Cart');
  await expect(cartPage.items).toHaveCount(1);
  await cartPage.startCheckout();
  await expect(checkoutPage.title).toHaveText('Checkout: Your Information');

  await checkoutPage.enterInformation(
    customer.firstName,
    customer.lastName,
    customer.postalCode
  );
  await checkoutPage.continue();

  await expect(checkoutPage.title).toHaveText('Checkout: Overview');
});

test('checkout overview shows the correct item details', async ({
  loginPage,
  inventoryPage,
  cartPage,
  checkoutPage,
}) => {
  const customer = bookingData[0];
  const products = selectedProducts.slice(0, 2);

  if (!customer || products.length !== 2) {
    throw new Error('Checkout customer information or product data is missing');
  }

  await loginPage.open();
  await loginPage.login(users.standard);
  await expect(inventoryPage.title).toHaveText('Products');

  for (const product of products) {
    await inventoryPage.addProduct(product.name);
  }

  await expect(inventoryPage.cartBadge).toHaveText(String(products.length));
  await cartPage.open();
  await expect(cartPage.title).toHaveText('Your Cart');
  await expect(cartPage.items).toHaveCount(products.length);
  await cartPage.startCheckout();
  await expect(checkoutPage.title).toHaveText('Checkout: Your Information');

  await checkoutPage.enterInformation(
    customer.firstName,
    customer.lastName,
    customer.postalCode
  );
  await checkoutPage.continue();

  await expect(checkoutPage.title).toHaveText('Checkout: Overview');
  await expect(checkoutPage.items).toHaveCount(products.length);

  for (const product of products) {
    const overviewItem = checkoutPage.item(product.name);
    await expect(overviewItem).toBeVisible();
    await expect(overviewItem.locator('.inventory_item_name')).toHaveText(
      product.name
    );
    await expect(overviewItem.locator('.inventory_item_price')).toHaveText(
      `$${(product.priceInCents / 100).toFixed(2)}`
    );
    await expect(overviewItem.locator('.cart_quantity')).toHaveText('1'    );
  }

  const itemTotalCents = products.reduce(
    (total, product) => total + product.priceInCents,
    0
  );
  const taxCents = Math.round(itemTotalCents * 0.08);
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  await expect(checkoutPage.itemTotal).toHaveText(
    `Item total: ${formatPrice(itemTotalCents)}`
  );
  await expect(checkoutPage.tax).toHaveText(`Tax: ${formatPrice(taxCents)}`);
  await expect(checkoutPage.orderTotal).toHaveText(
    `Total: ${formatPrice(itemTotalCents + taxCents)}`
  );

  await checkoutPage.finish();
  await expect(checkoutPage.title).toHaveText('Checkout: Complete!');
  await expect(checkoutPage.completionMessage).toHaveText(
    'Thank you for your order!'
  );
});
