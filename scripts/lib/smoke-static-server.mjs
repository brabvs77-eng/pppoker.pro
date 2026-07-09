import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript';
  if (filePath.endsWith('.css')) return 'text/css';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.mp4')) return 'video/mp4';
  if (filePath.endsWith('.json')) return 'application/json';
  return 'application/octet-stream';
}

function isBinaryAsset(filePath) {
  return /\.(mp4|webp|png|jpe?g|gif|woff2?|ico|svg)$/i.test(filePath);
}

export function startStaticServer(outDir, port = 9876) {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        let urlPath = req.url?.split('?')[0] ?? '/';
        if (urlPath.endsWith('/')) urlPath += 'index.html';
        const filePath = path.join(outDir, decodeURIComponent(urlPath));
        if (!filePath.startsWith(outDir)) {
          res.statusCode = 403;
          res.end('forbidden');
          return;
        }
        const data = isBinaryAsset(filePath)
          ? await fs.readFile(filePath)
          : await fs.readFile(filePath, 'utf8');
        res.setHeader('Content-Type', contentType(filePath));
        res.end(data);
      } catch {
        res.statusCode = 404;
        res.end('not found');
      }
    });
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}
