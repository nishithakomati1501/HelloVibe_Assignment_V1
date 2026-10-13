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
  const product = selectedProducts[0];// Select the first product for the checkout test

  if (!customer || !product) {
    throw new Error('Checkout customer information or product data is missing');// Throw an error if the required customer or product data is missing
  }

  await loginPage.open();
  await loginPage.login(users.standard);
  await expect(inventoryPage.title).toHaveText('Products'); // Assert that the inventory page displays the correct title

  await inventoryPage.addProduct(product.name);
  await expect(inventoryPage.cartBadge).toHaveText('1'); // Assert that the cart badge displays the correct number of items

  await cartPage.open();// Open the cart page for the checkout test
  await expect(cartPage.title).toHaveText('Your Cart');
  await expect(cartPage.items).toHaveCount(1);
  await cartPage.startCheckout();
  await expect(checkoutPage.title).toHaveText('Checkout: Your Information'); // Assert that the checkout page displays the correct title

  await checkoutPage.enterInformation(
    customer.firstName,
    customer.lastName,
    customer.postalCode
  );
  await checkoutPage.continue();

  await expect(checkoutPage.title).toHaveText('Checkout: Overview'); // Assert that the checkout overview page displays the correct title
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

  await expect(inventoryPage.cartBadge).toHaveText(String(products.length)); // Assert that the cart badge displays the correct number of items
  await cartPage.open();// Open the cart page for the checkout overview test
  await expect(cartPage.title).toHaveText('Your Cart');// Assert that the cart page displays the correct title
  await expect(cartPage.items).toHaveCount(products.length); // Assert that the cart displays the correct number of items
  await cartPage.startCheckout();// Start the checkout process from the cart page
  await expect(checkoutPage.title).toHaveText('Checkout: Your Information'); // Assert that the checkout information page displays the correct title  

  await checkoutPage.enterInformation(
    customer.firstName,
    customer.lastName,
    customer.postalCode
  );
  await checkoutPage.continue();
  // Continue to the checkout overview page
  await expect(checkoutPage.title).toHaveText('Checkout: Overview'); // Assert that the checkout overview page displays the correct title
  await expect(checkoutPage.items).toHaveCount(products.length);

  for (const product of products) {
    const overviewItem = checkoutPage.item(product.name);
    await expect(overviewItem).toBeVisible();
    await expect(overviewItem.locator('.inventory_item_name')).toHaveText(
      product.name
    ); // Assert that the overview item displays the correct name
    await expect(overviewItem.locator('.inventory_item_price')).toHaveText(
      `$${(product.priceInCents / 100).toFixed(2)}`
    ); // Assert that the overview item displays the correct price
    await expect(overviewItem.locator('.cart_quantity')).toHaveText('1'    );// Assert that the overview item displays the correct quantity
    
  }

  const itemTotalCents = products.reduce(
    (total, product) => total + product.priceInCents,
    0
  ); // Calculate the total price of all items in the cart
  const taxCents = Math.round(itemTotalCents * 0.08);
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;// Format a price in cents to a string in dollars

  await expect(checkoutPage.itemTotal).toHaveText(
    `Item total: ${formatPrice(itemTotalCents)}`// Assert that the item total displays the correct price
  );
  await expect(checkoutPage.tax).toHaveText(`Tax: ${formatPrice(taxCents)}`);
  await expect(checkoutPage.orderTotal).toHaveText(
    `Total: ${formatPrice(itemTotalCents + taxCents)}`
  );// Assert that the order total displays the correct price

  await checkoutPage.finish();
  await expect(checkoutPage.title).toHaveText('Checkout: Complete!');
  await expect(checkoutPage.completionMessage).toHaveText(
    'Thank you for your order!'
  ); // Assert that the completion message displays the correct text
});
