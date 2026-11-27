// posts.ts — repository trong bộ nhớ và service tin đăng (QT5).
// Service nhận repository qua tham số, nên test tạo repository riêng.
import { NotFoundError, ValidationError } from './errors.js';

export interface Post {
  id: string;
  title: string;
  price: number; // VND, số nguyên dương (QT5)
  status: 'available' | 'reserved' | 'sold';
  sellerId: string;
}

export function createMemoryRepository(initial: Post[]) {
  // bản sao: không sửa mảng truyền vào
  const posts = initial.map((p) => ({ ...p }));
  return {
    findAvailable: () => posts.filter((p) => p.status === 'available'),
    findById: (id: string) => posts.find((p) => p.id === id),
    insert(data: Omit<Post, 'id'>): Post {
      const post = { id: 'p' + (posts.length + 1), ...data };
      posts.push(post);
      return post;
    },
  };
}
export type PostRepository = ReturnType<typeof createMemoryRepository>;

export function createPostService(repo: PostRepository) {
  return {
    list: () => repo.findAvailable(),
    get(id: string): Post {
      const post = repo.findById(id);
      if (!post) throw new NotFoundError('POST_NOT_FOUND');
      return post;
    },
    create(input: unknown): Post {
      const body = input as { title?: unknown; price?: unknown } | null;
      const rawTitle = body?.title;
      const title = typeof rawTitle === 'string' ? rawTitle.trim() : '';
      const price = body?.price;
      if (!title || typeof price !== 'number'
          || !Number.isInteger(price) || price <= 0) {
        throw new ValidationError('QT5_VIOLATION');
      }
      return repo.insert({ title, price, status: 'available',
        sellerId: 'u1' });
    },
  };
}
export type PostService = ReturnType<typeof createPostService>;
