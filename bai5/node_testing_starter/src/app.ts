// app.ts — server HTTP của tin đăng với xử lý lỗi tập trung.
import { createServer, type IncomingMessage } from 'node:http';
import { AppError, ValidationError } from './errors.js';
import type { PostService } from './posts.js';

async function readJson(req: IncomingMessage): Promise<unknown> {
  let text = '';
  for await (const chunk of req) text += chunk;
  try {
    return JSON.parse(text);
  } catch {
    throw new ValidationError('INVALID_JSON');
  }
}

export function createApp(service: PostService) {
  return createServer(async (req, res) => {
    let status = 200;
    let body: unknown;
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts[0] !== 'posts' || parts.length > 2) {
        [status, body] = [404, { error: 'NOT_FOUND' }];
      } else if (req.method === 'GET') {
        body = parts[1] ? service.get(parts[1]) : service.list();
      } else if (req.method === 'POST' && !parts[1]) {
        [status, body] = [201, service.create(await readJson(req))];
      } else {
        [status, body] = [404, { error: 'NOT_FOUND' }];
      }
    } catch (err) {
      [status, body] = err instanceof AppError
        ? [err.status, { error: err.code }]
        : [500, { error: 'INTERNAL_ERROR' }];
    }
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  });
}
