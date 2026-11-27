// posts.test.ts — test mẫu; viết thêm test của Bài 1 và Bài 2 vào đây.
import { createMemoryRepository, createPostService } from '../src/posts.js';
import { NotFoundError, ValidationError } from '../src/errors.js';
import { POSTS } from './fixtures.js';

test('list chỉ trả tin available', () => {
  // Arrange: mỗi test tự tạo repository và service riêng
  const service = createPostService(createMemoryRepository(POSTS));
  // Act
  const result = service.list();
  // Assert
  expect(result).toHaveLength(6);
  expect(result.every((p) => p.status === 'available')).toBe(true);
});

// (a) describe('get') và test create
describe('get', () => {
  test('lấy được p2 có tiêu đề Sach Clean Code', () => {
    const service = createPostService(createMemoryRepository(POSTS));
    expect(service.get('p2').title).toBe('Sach Clean Code');
  });

  test('id p99 ném NotFoundError với message POST_NOT_FOUND', () => {
    const service = createPostService(createMemoryRepository(POSTS));
    expect(() => service.get('p99')).toThrow(NotFoundError);
    expect(() => service.get('p99')).toThrow('POST_NOT_FOUND');
  });
});

test('create với dữ liệu hợp lệ trả đúng tin p9 (tiêu đề đã bỏ khoảng trắng hai đầu)', () => {
  const service = createPostService(createMemoryRepository(POSTS));
  const post = service.create({ title: '  Quat dien  ', price: 250000 });
  expect(post).toEqual({
    id: 'p9',
    title: 'Quat dien',
    price: 250000,
    status: 'available',
    sellerId: 'u1',
  });
});

// (b) bảy cách vi phạm QT5
test.each([
  ['tiêu đề rỗng', { title: '', price: 1000 }],
  ['tiêu đề chỉ có khoảng trắng', { title: '   ', price: 1000 }],
  ['giá bằng 0', { title: 'Quat dien', price: 0 }],
  ['giá âm', { title: 'Quat dien', price: -5 }],
  ['giá lẻ', { title: 'Quat dien', price: 1000.5 }],
  ['giá là chuỗi', { title: 'Quat dien', price: '1000' }],
  ['body null', null],
])('create vi phạm QT5: %s', (_name, input) => {
  const service = createPostService(createMemoryRepository(POSTS));
  expect(() => service.create(input)).toThrow(ValidationError);
  expect(() => service.create(input)).toThrow('QT5_VIOLATION');
});

// Bài 2: ở bước (a) service được tạo một lần ở cấp describe nên hai test dùng chung trạng thái;
// bước (b) chuyển việc tạo service vào beforeEach
describe('độc lập giữa các test', () => {
  let service: ReturnType<typeof createPostService>;

  // (b) mỗi test có service mới
  beforeEach(() => {
    service = createPostService(createMemoryRepository(POSTS));
  });

  test('tạo tin và kiểm tra id là p9', () => {
    expect(service.create({ title: 'Quat dien', price: 250000 }).id).toBe('p9');
  });

  test('sau đó list() có 6 tin', () => {
    expect(service.list()).toHaveLength(6);
  });
});
