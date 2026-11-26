# node_runtime_starter

```
npm install
npm start        # số đơn: 1000 | doanh thu: 254120000
npm run check    # không in lỗi = môi trường sẵn sàng
```

Quy tắc áp dụng: QT5 — giá là số nguyên dương, đơn vị VND.

## Bài 1 — event loop
```
npx tsx src/exercise1.ts        # (a) tính đồng bộ: lag ≈ thời gian tính
npx tsx src/exercise1.ts wait   # (b) chờ bất đồng bộ 700 ms: lag ~0-3 ms
```

## Bài 4 — worker
```
npx tsx src/exercise4.ts
npm run build && node dist/exercise4.js
```
