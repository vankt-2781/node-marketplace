// Đọc request, gọi service, ghi response. File duy nhất trong posts/ biết về node:http.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { ValidationError } from '../errors.js';
import { getShippingFee } from '../shipping/shippingService.js';
import type { PostService } from './postService.js';

function send(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

// Trả true nếu đã xử lý request, false nếu không phải route của posts.
export function createPostRoutes(service: PostService) {
  return async function handle(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const parts = url.pathname.split('/').filter(Boolean);

    if (req.method === 'GET' && url.pathname === '/posts') {
      send(res, 200, service.listAvailable());
      return true;
    }

    const isPostId = parts[0] === 'posts' && parts.length === 2;
    if (req.method === 'GET' && isPostId) {
      send(res, 200, service.getById(parts[1]));
      return true;
    }

    const isShipping = parts[0] === 'posts' && parts.length === 3 && parts[2] === 'shipping';
    if (req.method === 'GET' && isShipping) {
      send(res, 200, await getShippingFee(parts[1]));
      return true;
    }

    if (req.method === 'POST' && url.pathname === '/posts') {
      let text = '';
      for await (const chunk of req) text += chunk;
      let body;
      try {
        body = JSON.parse(text);
      } catch {
        throw new ValidationError('INVALID_JSON');
      }
      send(res, 201, service.create(body));
      return true;
    }

    return false;
  };
}
