import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { userAgreement } from './lib/legal-translations/user-agreement.mjs';
import { privacyPolicy } from './lib/legal-translations/privacy-policy.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(
  __dirname,
  '../apps/web/src/config/page-translations/legal.json',
);

const output = {
  'user-agreement': userAgreement,
  'privacy-policy': privacyPolicy,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Wrote ${outPath}`);
