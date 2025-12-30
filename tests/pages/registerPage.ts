import { Page } from '@playwright/test';
import { BasePage } from './basePage';

export class RegisterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/auth/register', { waitUntil: 'networkidle' });
  }

  get firstName()  { return this.page.getByLabel(/first name/i); }
  get lastName()   { return this.page.getByLabel(/last name/i); }
  get email()      { return this.page.getByLabel(/email address/i); }
  get password()   { return this.page.getByLabel(/password/i); }
  get confirmPass(){ return this.page.getByLabel(/confirm password/i); }
  get submitBtn()  { return this.page.getByRole('button', { name: /register/i }); }

  get DOB()      { return this.page.getByLabel(/date of birth/i); }
  get Street()   { return this.page.getByLabel(/street/i); }
  get City()     { return this.page.getByLabel(/city/i); }
  get State()    { return this.page.getByLabel(/state/i); }
  get Zip()      { return this.page.getByLabel(/postal code/i); }
  //get Country()  { return this.page.getByLabel(/country/i); }
  get Country()  { return this.page.locator('#country'); }
  get Phone()    { return this.page.getByLabel(/phone/i); }

  async registerUser(user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    dob: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
  }) {
    await this.safeFill(this.firstName, user.firstName, 'First name');
    await this.safeFill(this.lastName, user.lastName, 'Last name');
    await this.safeFill(this.email, user.email, 'Email');
    await this.safeFill(this.password, user.password, 'Password');
    //await this.safeFill(this.confirmPass, user.password, 'Confirm password');

    await this.safeFill(this.DOB, user.dob, 'Date of Birth');
    await this.safeFill(this.Street, user.street, 'Street');
    await this.safeFill(this.City, user.city, 'City');
    await this.safeFill(this.State, user.state, 'State');
    await this.safeFill(this.Zip, user.zip, 'Postal Code');
    await this.safeSelectOption(this.Country, user.country, 'Country');
    await this.safeFill(this.Phone, user.phone, 'Phone');
    await this.safeClick(this.submitBtn, 'Register button');

    // Wait for redirect to login page or a success message after registration
    try {
      await this.page.waitForURL('**/auth/login', { timeout: 10000 });
    } catch {
      // Fallback: wait for networkidle and allow test to assert URL
      await this.page.waitForLoadState('networkidle');
    }
  }
}
