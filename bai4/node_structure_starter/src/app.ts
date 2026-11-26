// Tạo server và định tuyến. Nơi duy nhất bắt lỗi và ghi log request.
import { randomUUID } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import { AppError, NotFoundError } from './errors.js';
import { logger } from './logger.js';
import type { PostRepository } from './posts/postRepository.js';
import { createPostService } from './posts/postService.js';
import { createPostRoutes } from './posts/postRoutes.js';
import { requestContext } from './requestContext.js';

export function createApp(repo: PostRepository): Server {
  const handlePosts = createPostRoutes(createPostService(repo));

  return createServer((req, res) => {
    const header = req.headers['x-request-id'];
    const requestId = (Array.isArray(header) ? header[0] : header) || randomUUID();
    res.setHeader('x-request-id', requestId);

    return requestContext.run({ requestId }, async () => {
      const start = performance.now();
      logger.info('bắt đầu request', { method: req.method, url: req.url });
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      try {
        if (await handlePosts(req, res)) return;
        throw new NotFoundError('NOT_FOUND');
      } catch (err) {
        if (err instanceof AppError) {
          logger.warn(err.code, { status: err.status });
          res.statusCode = err.status;
          res.end(JSON.stringify({ error: err.code }));
        } else {
          logger.error(err instanceof Error ? err.message : String(err), {
            stack: err instanceof Error ? err.stack : undefined,
          });
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'INTERNAL_ERROR' }));
        }
      } finally {
        logger.info('kết thúc request', {
          status: res.statusCode,
          durationMs: Math.round(performance.now() - start),
        });
      }
    });
  });
}
