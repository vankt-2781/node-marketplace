// Gắn requestId vào toàn bộ chuỗi xử lý của một request, không cần truyền qua tham số.
import { AsyncLocalStorage } from 'node:async_hooks';

export const requestContext = new AsyncLocalStorage<{ requestId: string }>();
