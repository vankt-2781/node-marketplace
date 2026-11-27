import { jest } from '@jest/globals';
import { withRetry } from '../src/retry.js';

const transient = () => Object.assign(new Error('reset'), { code: 'ECONNRESET' });
const isRetryable = (err: unknown) => (err as { code?: string }).code === 'ECONNRESET';
const opts = { retries: 3, baseDelayMs: 100, isRetryable };

// (a) fn lỗi ECONNRESET hai lần rồi trả 30000; sleep là mock rỗng
test('retry lỗi tạm thời: gọi fn 3 lần, sleep nhận 100 rồi 200', async () => {
  const fn = jest.fn<() => Promise<number>>()
    .mockRejectedValueOnce(transient())
    .mockRejectedValueOnce(transient())
    .mockResolvedValue(30000);
  const sleep = jest.fn<(ms: number) => Promise<void>>().mockResolvedValue(undefined);

  const result = await withRetry(fn, { ...opts, sleep });

  expect(result).toBe(30000);
  expect(fn).toHaveBeenCalledTimes(3);
  expect(sleep.mock.calls).toEqual([[100], [200]]);
});

// (b) lỗi không tạm thời: reject, fn gọi một lần, sleep không được gọi
test('lỗi không tạm thời: reject ngay, không retry', async () => {
  const fn = jest.fn<() => Promise<number>>()
    .mockRejectedValue(Object.assign(new Error('bad'), { code: 'E_BAD_REQUEST' }));
  const sleep = jest.fn<(ms: number) => Promise<void>>().mockResolvedValue(undefined);

  await expect(withRetry(fn, { ...opts, sleep })).rejects.toThrow('bad');

  expect(fn).toHaveBeenCalledTimes(1);
  expect(sleep).not.toHaveBeenCalled();
});

// (c) không truyền sleep: dùng fake timer, tua 300 ms (100 + 200)
test('fake timer: tổng backoff 300 ms nhưng test chạy tức thì', async () => {
  jest.useFakeTimers();
  try {
    const fn = jest.fn<() => Promise<number>>()
      .mockRejectedValueOnce(transient())
      .mockRejectedValueOnce(transient())
      .mockResolvedValue(30000);

    const promise = withRetry(fn, opts);
    await jest.advanceTimersByTimeAsync(300);

    await expect(promise).resolves.toBe(30000);
  } finally {
    jest.useRealTimers();
  }
});
