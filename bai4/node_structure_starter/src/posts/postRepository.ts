// Nạp và truy xuất tin đăng. Không biết gì về HTTP.
import { readFile } from 'node:fs/promises';

export interface Post {
  id: string;
  title: string;
  price: number;
  status: string;
  sellerId: string;
}

export interface PostRepository {
  findAvailable(): Post[];
  findById(id: string): Post | undefined;
  count(): number;
  add(post: Post): void;
}

export async function createPostRepository(file: URL): Promise<PostRepository> {
  const posts = JSON.parse(await readFile(file, 'utf8')) as Post[];
  return {
    findAvailable: () => posts.filter((p) => p.status === 'available'),
    findById: (id) => posts.find((p) => p.id === id),
    count: () => posts.length,
    add: (post) => {
      posts.push(post);
    },
  };
}
