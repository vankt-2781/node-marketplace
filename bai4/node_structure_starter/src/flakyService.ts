// flakyService.ts — dịch vụ phí vận chuyển không ổn định, dùng ở Bài 4.
// Mỗi tin: hai lần gọi đầu lỗi tạm thời (ECONNRESET), lần thứ ba thành
// công. Riêng p8 luôn lỗi tạm thời (dịch vụ ngừng hẳn). postId không
// đúng dạng p<số> thì lỗi vĩnh viễn (E_BAD_REQUEST), gọi lại vô ích.
// Không sửa file này: số liệu kiểm chứng trong bài tính trên bản gốc.
import { setTimeout as sleep } from 'node:timers/promises';

const attempts = new Map<string, number>();

export class ServiceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ServiceError';
  }
}

export async function getShippingQuote(
  postId: string,
): Promise<number> {
  await sleep(50);
  if (!/^p\d+$/.test(postId)) {
    const msg = `postId không hợp lệ: ${postId}`;
    throw new ServiceError(msg, 'E_BAD_REQUEST');
  }
  const n = (attempts.get(postId) ?? 0) + 1;
  attempts.set(postId, n);
  if (postId === 'p8' || n <= 2) {
    const msg = `lần gọi ${n} bị ngắt kết nối`;
    throw new ServiceError(msg, 'ECONNRESET');
  }
  return 30000;
}
