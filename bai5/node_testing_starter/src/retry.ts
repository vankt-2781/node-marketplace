// retry.ts — gọi lại hàm bất đồng bộ khi gặp lỗi tạm thời.
// Hàm chờ `sleep` truyền vào được, để test thay bằng bản giả.
// Bản mặc định dùng setTimeout toàn cục: fake timer của Jest thay được
// setTimeout toàn cục, nhưng không thay được node:timers/promises.
export interface RetryOptions {
  retries: number;
  baseDelayMs: number;
  isRetryable: (err: unknown) => boolean;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(
  fn: () => Promise<T>, opts: RetryOptions,
): Promise<T> {
  const sleep = opts.sleep ?? defaultSleep;
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt > opts.retries || !opts.isRetryable(err)) throw err;
      // độ trễ nhân đôi: 100, 200, 400 ms với baseDelayMs = 100
      await sleep(opts.baseDelayMs * 2 ** (attempt - 1));
    }
  }
}
