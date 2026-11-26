import { setTimeout as sleep } from 'node:timers/promises';

export interface RetryOptions {
  retries: number; // số lần thử lại (không tính lần gọi đầu)
  baseDelayMs: number; // độ trễ gốc, nhân đôi sau mỗi lần
  isRetryable: (err: unknown) => boolean;
  onRetry?: (err: unknown, attempt: number, delayMs: number) => void;
}

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= opts.retries || !opts.isRetryable(err)) throw err;
      const delayMs = opts.baseDelayMs * 2 ** attempt; // 100, 200, 400, ...
      opts.onRetry?.(err, attempt + 1, delayMs);
      await sleep(delayMs);
    }
  }
}
