import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { users } from '../../data/users';

test('standard user', async ({ page, loginPage,}) => {
  // standard user: Login is successful and the user is redirected to the inventory page
   await loginPage.open();
   await loginPage.login(users.standard);
});
test('lockedOut', async ({ page, loginPage,}) => {
  // lockedOut : Login is rejected with the correct message
   await loginPage.open();
   await loginPage.login(users.lockedOut);
  await page.pause()
});