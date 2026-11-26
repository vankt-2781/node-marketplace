// legacyServer.ts — Học phần Node.js, nhóm Tổ chức code & xử lý lỗi
// Mục đích: server tin đăng viết dồn trong một file, cấu hình đọc rải
// rác, không có xử lý lỗi tập trung. Đây là điểm xuất phát để tái
// cấu trúc ở Bài 1 và Bài 2. Giữ nguyên file này để so sánh.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const file = new URL('../data/posts.json', import.meta.url);
const posts = JSON.parse(await readFile(file, 'utf8'));

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const parts = url.pathname.split('/').filter(Boolean);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'GET' && url.pathname === '/posts') {
    const list = posts.filter((p: any) => p.status === 'available');
    return res.end(JSON.stringify(list));
  }
  const isPostId = parts[0] === 'posts' && parts.length === 2;
  if (req.method === 'GET' && isPostId) {
    const post = posts.find((p: any) => p.id === parts[1]);
    if (!post) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'POST_NOT_FOUND' }));
    }
    return res.end(JSON.stringify(post));
  }
  if (req.method === 'POST' && url.pathname === '/posts') {
    let text = '';
    for await (const chunk of req) text += chunk;
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'INVALID_JSON' }));
    }
    // Lỗi tiềm ẩn: body là null thì dòng dưới ném TypeError
    if (!body.title?.trim() || !Number.isInteger(body.price)
        || body.price <= 0) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'QT5_VIOLATION' }));
    }
    const post = { id: 'p' + (posts.length + 1), title: body.title,
      price: body.price, status: 'available', sellerId: 'u1' };
    posts.push(post);
    res.statusCode = 201;
    return res.end(JSON.stringify(post));
  }
  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'NOT_FOUND' }));
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => console.log('legacy server, cổng', port));
