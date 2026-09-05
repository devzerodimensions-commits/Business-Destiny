import { randomBytes } from 'node:crypto';
import { writeFile, access } from 'node:fs/promises';
import { passwordHash } from './api.mjs';
try {
  await access('.env');
  console.log('Admin environment already exists.');
  process.exit(0);
} catch {}
const password = 'BD!' + randomBytes(12).toString('base64url');
const salt = randomBytes(24).toString('hex');
const hash = await passwordHash(password, salt);
const config = `ADMIN_USERNAME=admin\nADMIN_SALT=${salt}\nADMIN_PASSWORD_HASH=${hash}\n`;
await writeFile('.env', config, { mode: 0o600 });
await writeFile('.dev.vars', config, { mode: 0o600 });
await writeFile(
  '.credentials.txt',
  `Business Destiny administrator\nUsername: admin\nPassword: ${password}\n\nChange your password after first login in Account settings.\n`,
  { mode: 0o600 },
);
console.log(
  'Admin account generated. Credentials saved privately in .credentials.txt.',
);
