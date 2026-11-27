# node_testing_starter

Học liệu cho topic **Testing** — Học phần Node.js.
Bối cảnh: hệ thống mua bán đồ cũ (xem Hồ sơ Mini-project).

## Cách dựng bộ học liệu này

Tạo đúng cây thư mục dưới đây, sao chép nội dung từng file từ bài học:

    node_testing_starter/
    ├── package.json
    ├── tsconfig.json
    ├── jest.config.js
    ├── README.md
    ├── src/
    │   ├── errors.ts
    │   ├── posts.ts
    │   ├── retry.ts
    │   └── app.ts
    └── tests/
        ├── fixtures.ts
        └── posts.test.ts

Bộ học liệu không kèm `package-lock.json` vì file đó quá dài để sao
chép tay. `package.json` ghim chính xác phiên bản của từng gói.

## Chạy

    npm install
    npm test                 # 1 test mẫu đạt
    npm run test:coverage    # kèm bảng độ phủ
    npm run check            # kiểm kiểu cả src và tests

## Dùng ở bài nào

- `src/posts.ts`: Bài 1 và Bài 2, test viết vào `tests/posts.test.ts`
- `src/retry.ts`: Bài 3, test viết vào `tests/retry.test.ts`
- `src/app.ts`: Bài 4, test viết vào `tests/app.test.ts`

`src/` là mã cần test, đã chạy đúng; chỉ sửa khi đề bài yêu cầu.
