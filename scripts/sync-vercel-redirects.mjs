import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(rootDir, 'content/manifest.json');
const vercelPath = path.join(rootDir, 'vercel.json');

function redirectSource(route) {
  if (route === '/') return '/';
  return route.replace(/\/$/, '');
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const vercel = JSON.parse(await fs.readFile(vercelPath, 'utf8'));

  const redirects = [
    { source: '/ru', destination: '/', permanent: true },
    { source: '/ru/:path*', destination: '/:path*', permanent: true },
    { source: '/user-agreement', destination: '/en/user-agreement', permanent: true },
    { source: '/privacy-policy', destination: '/en/privacy-policy', permanent: true },
    { source: '/tag/pppoker-2', destination: '/tag/pppoker', permanent: true },
  ];
  const seen = new Set(redirects.map((entry) => entry.source));

  for (const page of manifest.pages) {
    if (!page.isRedirect || !page.redirectTo) continue;

    const source = redirectSource(page.route);
    const destination = redirectSource(page.redirectTo);

    if (source === destination) continue;
    if (seen.has(source)) continue;

    seen.add(source);
    redirects.push({
      source,
      destination: destination === '/' ? '/' : destination,
      permanent: true,
    });
  }

  redirects.sort((a, b) => a.source.localeCompare(b.source));
  vercel.redirects = redirects;

  await fs.writeFile(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`, 'utf8');
  console.log(`Synced ${redirects.length} redirects to vercel.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
