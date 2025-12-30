import fs from 'fs';
import path from 'path';
import { test } from '@fixtures/fixtures';

const AUTH_DIR = path.join(process.cwd(), '.auth');
const STATE_FILE = path.join(AUTH_DIR, 'daily.json');
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

test('ensure auth storageState (create once per day)', async ({ registerPage, loginPage, page }) => {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

  let needsCreate = true;
  const credFile = path.join(AUTH_DIR, 'daily-credentials.json');
  if (fs.existsSync(STATE_FILE)) {
    const stats = fs.statSync(STATE_FILE);
    if (Date.now() - stats.mtimeMs < ONE_DAY_MS) {
      // If credentials file exists, validate its contents
      if (fs.existsSync(credFile)) {
        try {
          const raw = fs.readFileSync(credFile, 'utf-8');
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.email === 'string' && typeof parsed.password === 'string' && parsed.email && parsed.password) {
            needsCreate = false;
          }
        } catch (e) {
          // invalid credentials file — recreate
          needsCreate = true;
        }
      }
    }
  }

  if (!needsCreate) {
    console.log('Auth storageState is fresh — skipping creation.');
    return;
  }

  // Create a new user and save storageState
  const ts = Date.now();
  const user = {
    firstName: 'QA',
    lastName: 'Daily',
    email: `qa_daily_${ts}@example.com`,
    password: 'Q2@Atest123!',
    dob: '1990-01-01',
    street: '123 Testing Way',
    city: 'Sydney',
    state: 'NSW',
    zip: '98765',
    country: 'Australia',
    phone: '1234567890'
  };

  console.log('Creating daily auth user:', user.email);
  await registerPage.goto();
  await registerPage.registerUser(user);
  await loginPage.goto();
  await loginPage.login(user.email, user.password);

  // Save storage state
  await page.context().storageState({ path: STATE_FILE });
  console.log('Saved storageState to', STATE_FILE);

  // Save credentials so other tests can login using the same account
  fs.writeFileSync(credFile, JSON.stringify({ email: user.email, password: user.password }, null, 2), 'utf-8');
  console.log('Saved credentials to', credFile);
});
