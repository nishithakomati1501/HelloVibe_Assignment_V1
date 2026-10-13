import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { users } from '../../data/users';

test('standard user reaches the inventory page', async ({
  page,
  loginPage,
}) => {
  await loginPage.open();
  await loginPage.login(users.standard);// Perform login with the standard user credentials

  await expect(page).toHaveURL(/\/inventory\.html$/); // Assert that the user is redirected to the inventory page
  await expect(page.locator('[data-test="title"]')).toHaveText('Products'); // Assert that the inventory page displays the correct title
});

test('locked-out user sees the expected error', async ({ loginPage }) => {
  await loginPage.open();// Open the login page for the locked-out user test
  await loginPage.login(users.lockedOut);// Perform login with the locked-out user credentials

  await expect(loginPage.errorMessage).toHaveText(
    'Epic sadface: Sorry, this user has been locked out.'
  ); // Assert that the correct error message is displayed for the locked-out user
});