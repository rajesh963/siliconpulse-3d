import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = path.resolve('dist');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

// Pre-compress text assets with brotli (Serveo's HTTP tunnel truncates large
// uncompressed responses; the 1.5 MB app bundle becomes ~314 KB).
for (const dir of [root, path.join(root, 'assets')]) {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    if (!fs.statSync(file).isFile()) continue;
    if (!/\.(js|css|svg|json|html)$/.test(name)) continue;
    const br = file + '.br';
    if (!fs.existsSync(br)) {
      fs.writeFileSync(br, zlib.brotliCompressSync(fs.readFileSync(file), {
        params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 },
      }));
    }
  }
}

const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname); }
  catch { res.writeHead(400); res.end(); return; }

  let file = path.join(root, pathname);
  if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');

  const ext = path.extname(file);
  const br = file + '.br';
  const acceptsBr = (req.headers['accept-encoding'] ?? '').includes('br');
  const useBr = acceptsBr && fs.existsSync(br);
  const target = useBr ? br : file;
  const stat = fs.statSync(target);
  const headers = {
    'content-type': types[ext] ?? 'application/octet-stream',
    'content-length': stat.size,
    'cache-control': 'no-store',
    vary: 'Accept-Encoding',
  };
  if (useBr) headers['content-encoding'] = 'br';
  res.writeHead(200, headers);
  fs.createReadStream(target).pipe(res);
});

server.listen(3001, '127.0.0.1', () => console.log('dist server on http://127.0.0.1:3001'));
