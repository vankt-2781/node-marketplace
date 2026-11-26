import { ValidationError } from '../errors.js';
import { getShippingQuote, ServiceError } from '../flakyService.js';
import { logger } from '../logger.js';
import { withRetry } from './retry.js';

const RETRYABLE = new Set(['ECONNRESET', 'ETIMEDOUT']);
const codeOf = (err: unknown) => (err instanceof ServiceError ? err.code : undefined);

export interface ShippingResult {
  fee: number | null;
  degraded: boolean;
}

export async function getShippingFee(postId: string): Promise<ShippingResult> {
  try {
    const fee = await withRetry(() => getShippingQuote(postId), {
      retries: 3,
      baseDelayMs: 100,
      isRetryable: (err) => RETRYABLE.has(codeOf(err) ?? ''),
      onRetry: (err, attempt, delayMs) =>
        logger.warn('retry getShippingQuote', { postId, attempt, delayMs, code: codeOf(err) }),
    });
    return { fee, degraded: false };
  } catch (err) {
    if (codeOf(err) === 'E_BAD_REQUEST') throw new ValidationError('INVALID_POST_ID');
    if (RETRYABLE.has(codeOf(err) ?? '')) return { fee: null, degraded: true }; // hết lượt retry
    throw err;
  }
}
