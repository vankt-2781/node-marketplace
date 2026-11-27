import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from '../src/app.js';
import { createMemoryRepository, createPostService } from '../src/posts.js';
import { POSTS } from './fixtures.js';

let server: Server;
let base: string;

// (a) khởi động server ở cổng ngẫu nhiên, lấy cổng từ server.address()
beforeAll(async () => {
  server = createApp(createPostService(createMemoryRepository(POSTS)));
  await new Promise<void>((resolve) => server.listen(0, resolve));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

const post = (body: string) => fetch(`${base}/posts`, { method: 'POST', body });

// (b) năm test bằng fetch
test('GET /posts trả 200 với 6 tin', async () => {
  const res = await fetch(`${base}/posts`);
  expect(res.status).toBe(200);
  expect(await res.json()).toHaveLength(6);
});

test('GET /posts/p99 trả 404 POST_NOT_FOUND', async () => {
  const res = await fetch(`${base}/posts/p99`);
  expect(res.status).toBe(404);
  expect(await res.json()).toEqual({ error: 'POST_NOT_FOUND' });
});

test('POST giá 0 trả 400 QT5_VIOLATION', async () => {
  const res = await post('{"title":"Quat dien","price":0}');
  expect(res.status).toBe(400);
  expect(await res.json()).toEqual({ error: 'QT5_VIOLATION' });
});

test('POST sai JSON trả 400 INVALID_JSON', async () => {
  const res = await post('{bad');
  expect(res.status).toBe(400);
  expect(await res.json()).toEqual({ error: 'INVALID_JSON' });
});

test('POST hợp lệ trả 201', async () => {
  const res = await post('{"title":"Quat dien","price":250000}');
  expect(res.status).toBe(201);
  expect(await res.json()).toMatchObject({ title: 'Quat dien', price: 250000 });
});
