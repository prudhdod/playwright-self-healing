// tests/fixtures/fixtures.ts
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { RegisterPage } from '@pages/registerPage';

type PageFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
};

export const test = base.extend<PageFixtures>({
  registerPage: async ({ page }, use) => {
    const regPage = new RegisterPage(page);
    await use(regPage);
  },
  loginPage: async ({ page }, use) => {
    const lp = new LoginPage(page);
    await use(lp);
  },
});

export { expect };
