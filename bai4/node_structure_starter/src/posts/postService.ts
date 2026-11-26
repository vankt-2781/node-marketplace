// Quy tắc nghiệp vụ của tin đăng (QT5). Không biết gì về HTTP.
import { NotFoundError, ValidationError } from '../errors.js';
import { logger } from '../logger.js';
import type { Post, PostRepository } from './postRepository.js';

export function createPostService(repo: PostRepository) {
  return {
    listAvailable: () => repo.findAvailable(),
    getById(id: string): Post {
      const post = repo.findById(id);
      if (!post) throw new NotFoundError('POST_NOT_FOUND');
      return post;
    },

    // QT5: tiêu đề không rỗng, giá là số nguyên dương (VND).
    // body null cũng là vi phạm QT5.
    create(body: any): Post {
      if (!body || !body.title?.trim() || !Number.isInteger(body.price) || body.price <= 0) {
        throw new ValidationError('QT5_VIOLATION');
      }
      const post: Post = {
        id: 'p' + (repo.count() + 1),
        title: body.title,
        price: body.price,
        status: 'available',
        sellerId: 'u1',
      };
      repo.add(post);
      logger.info('đã tạo tin', { postId: post.id });
      return post;
    },
  };
}

export type PostService = ReturnType<typeof createPostService>;
