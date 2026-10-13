import { expect } from '@playwright/test';
import { selectedProducts } from '../../data/products';
import { users } from '../../data/users';
import { test } from '../fixtures';

const productsInCart = selectedProducts.slice(0, 2); // Select the first two products for the cart tests

test.beforeEach(async ({ loginPage, inventoryPage, cartPage }) => {
  await loginPage.open();
  await loginPage.login(users.standard);

  for (const product of productsInCart) {
    await inventoryPage.addProduct(product.name);
  } // Add the selected products to the cart before each test

  await cartPage.open();
});// End of beforeEach hook

test('cart displays the correct item count', async ({ cartPage }) => {
  await expect(cartPage.items).toHaveCount(productsInCart.length); // Assert that the cart displays the correct number of items

  for (const product of productsInCart) {
    await expect(cartPage.item(product.name)).toBeVisible();
  }
});

test('Continue Shopping returns to the inventory', async ({
  inventoryPage,
  cartPage,
}) => {
  await cartPage.continueShopping();

  await expect(inventoryPage.title).toHaveText('Products');
});

test('Checkout opens the checkout information form', async ({
  cartPage,
  checkoutPage,
}) => {
  await cartPage.startCheckout();

  await expect(checkoutPage.firstNameInput).toBeVisible();
  await expect(checkoutPage.lastNameInput).toBeVisible();
  await expect(checkoutPage.postalCodeInput).toBeVisible();
});