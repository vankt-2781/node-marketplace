# node_io_starter

Học liệu cho topic **Stream, file và network** — Học phần Node.js.
Bối cảnh: hệ thống mua bán đồ cũ (xem Hồ sơ Mini-project).

## Cách dựng bộ học liệu này

Tạo đúng cây thư mục dưới đây, sao chép nội dung từng file từ bài học:

    node_io_starter/
    ├── package.json
    ├── tsconfig.json
    ├── README.md
    ├── data/
    │   └── posts.json
    └── src/
        ├── genOrders.ts
        └── index.ts

Bộ học liệu không kèm `package-lock.json` vì file đó quá dài để sao
chép tay. Thay vào đó, `package.json` ghim chính xác phiên bản của từng
gói (không có dấu `^`), nên `npm install` luôn cài đúng bản đã dùng để
kiểm chứng số liệu trong bài.

## Chạy

    npm install
    npm start          # in phiên bản Node.js và số tin trong posts.json
    npm run check      # kiểm kiểu, không in gì là không có lỗi
    npm run gen        # sinh data/orders.ndjson (khoảng 85 MB), Bài 3

## Dùng ở bài nào

- `data/posts.json`: Bài 1, Bài 2 và Bài 4 (cùng dữ liệu với topic
  Bất đồng bộ)
- `src/genOrders.ts`: Bài 3. Đơn là dữ liệu giả lập, `postId` không
  đối chiếu với `posts.json`
- Bài 4 chạy từ bản build: `npm run build` rồi `node dist/server.js`

Không sửa `src/genOrders.ts` và `data/posts.json`: số liệu kiểm chứng
trong bài tính trên nội dung gốc của hai file này. `data/orders.ndjson`
sinh lại được bất cứ lúc nào, không cần sao chép.
