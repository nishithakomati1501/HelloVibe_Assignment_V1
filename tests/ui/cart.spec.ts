import { expect } from '@playwright/test';
import { selectedProducts } from '../../data/products';
import { users } from '../../data/users';
import { test } from '../fixtures';
test('standard user can add the Backpack and Bike Light to the cart', async ({
  page,
  loginPage,
  inventoryPage,
}) => {
  const productNames = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];
  const products = productNames.map((name) =>
    selectedProducts.find((product) => product.name === name)
  );
  if (products.some((product) => !product)) {
    throw new Error('A requested product is missing from selectedProducts');
  }
  await loginPage.open();
  await loginPage.login(users.standard);
  await expect(page).toHaveURL(/\/inventory\.html$/);
  for (const product of products) {
    if (!product) {
      continue;
    }
    const productCard = inventoryPage.productCard(product.name);
    await expect(productCard).toBeVisible();
    await inventoryPage.addProduct(product.name);
    await expect(
      productCard.getByRole('button', { name: 'Remove', exact: true })
    ).toBeVisible();
  }
  await expect(inventoryPage.cartBadge).toHaveText(String(products.length));
  await page.pause()
});
test('cart contains both selected products', async ({
  page,
  loginPage,
  inventoryPage,
  cartPage,
}) => {
  const products = selectedProducts.slice(0, 2);
  await loginPage.open();
  await loginPage.login(users.standard);
  await expect(page).toHaveURL(/\/inventory\.html$/);
  for (const product of products) {
    await inventoryPage.addProduct(product.name);
  }
  await expect(inventoryPage.cartBadge).toHaveText(String(products.length));
  await inventoryPage.openCart();
  await expect(page).toHaveURL(/\/cart\.html$/);
  await expect(cartPage.items).toHaveCount(products.length);
  for (const product of products) {
    const cartItem = cartPage.item(product.name);
    await expect(cartItem).toBeVisible();
    await expect(cartItem.locator('.inventory_item_name')).toHaveText(
      product.name
    );
  }
});
test('cart displays the individual prices of both selected products', async ({
  page,
  loginPage,
  inventoryPage,
  cartPage,
}) => {
  const products = selectedProducts.slice(0, 2);
  await loginPage.open();
  await loginPage.login(users.standard);
  await expect(page).toHaveURL(/\/inventory\.html$/);
  for (const product of products) {
    await inventoryPage.addProduct(product.name);
  }
  await expect(inventoryPage.cartBadge).toHaveText(String(products.length));
  await inventoryPage.openCart();
  await expect(page).toHaveURL(/\/cart\.html$/);
  await expect(cartPage.items).toHaveCount(products.length);
  for (const product of products) {
    const cartItem = cartPage.item(product.name);
    await expect(cartItem).toBeVisible();
    await expect(cartItem.locator('.inventory_item_price')).toHaveText(
      `$${(product.priceInCents / 100).toFixed(2)}`
    );
  }
});