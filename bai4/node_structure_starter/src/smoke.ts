// smoke.ts — kiểm tra hành vi API từ bên ngoài, dùng ở Bài 1 và Bài 2.
// Cách dùng: npm run smoke -- src/server.ts  (hoặc src/legacyServer.ts)
// Script tự khởi động server ở cổng 3100, gửi 8 request rồi tắt server.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const entry = process.argv[2] ?? 'src/server.ts';
const child = spawn(process.execPath, ['--import', 'tsx', entry], {
  env: { ...process.env, PORT: '3100' }, stdio: 'ignore',
});
const BASE = 'http://localhost:3100';

async function call(method: string, path: string, body?: string) {
  try {
    const res = await fetch(BASE + path, { method, body });
    return { status: res.status, json: await res.json() };
  } catch {
    return { status: 0, json: null }; // không kết nối được
  }
}

for (let i = 0; i < 50; i++) { // chờ server sẵn sàng, tối đa 5 giây
  if ((await call('GET', '/posts')).status !== 0) break;
  await sleep(100);
}
const cases: [string, () => Promise<boolean>][] = [
  ['GET /posts → 200, 6 tin', async () => {
    const r = await call('GET', '/posts');
    return r.status === 200 && r.json.length === 6; }],
  ['GET /posts/p2 → 200', async () =>
    (await call('GET', '/posts/p2')).json?.title === 'Sach Clean Code'],
  ['GET /posts/p99 → 404', async () =>
    (await call('GET', '/posts/p99')).json?.error === 'POST_NOT_FOUND'],
  ['POST hợp lệ → 201', async () => (await call('POST', '/posts',
    '{"title":"Quat dien","price":250000}')).status === 201],
  ['POST giá 0 → 400', async () => (await call('POST', '/posts',
    '{"title":"Quat dien","price":0}'))
    .json?.error === 'QT5_VIOLATION'],
  ['POST sai JSON → 400', async () => (await call('POST', '/posts',
    '{bad')).json?.error === 'INVALID_JSON'],
  ['POST body null → 4xx/5xx, không sập', async () =>
    (await call('POST', '/posts', 'null')).status >= 400],
  ['server còn sống sau đó', async () =>
    (await call('GET', '/nope')).json?.error === 'NOT_FOUND'],
];
let passed = 0;
for (const [name, test] of cases) {
  const ok = await test();
  if (ok) passed++;
  console.log(ok ? 'ĐẠT ' : 'LỖI ', name);
}
console.log(`${passed}/${cases.length} đạt`);
child.kill();
