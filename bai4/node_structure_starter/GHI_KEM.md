# Nội dung nộp bài — node_structure_starter

## Ghi kèm

### Tỉ lệ smoke test trước và sau khi xử lý lỗi tập trung
| Thời điểm | Lệnh | Tỉ lệ |
|---|---|---|
| Bản cũ (`legacyServer.ts`) | `npm run smoke -- src/legacyServer.ts` | **6/8 đạt** |
| Bài 1 — sau khi tách theo chức năng | `npm run smoke -- src/server.ts` | **6/8 đạt** (giống hệt bản cũ) |
| Bài 2 — sau khi xử lý lỗi tập trung (`AppError` + một `try/catch` ở `app.ts`) | `npm run smoke -- src/server.ts` | **8/8 đạt** |

### Hai mục lỗi còn lại ở Bài 1
1. `POST body null → 4xx/5xx, không sập`
2. `server còn sống sau đó`

Nguyên nhân: khi body là `null`, dòng `body.title?.trim()` ném `TypeError: Cannot read properties of null`. Lỗi này nằm trong handler `async` mà không ai bắt, nên tiến trình sập; mục 1 không nhận được phản hồi (status 0), mục 2 không còn server để trả lời. Bài 1 chỉ tách file nên giữ nguyên lỗi này. Sang Bài 2: lỗi khác `AppError` được `try/catch` duy nhất ở `app.ts` đổi thành `500 { error: 'INTERNAL_ERROR' }` kèm `console.error`, server không sập; rồi service coi body `null` là vi phạm QT5 nên trả `400 QT5_VIOLATION`.

## Bài tập nâng cao

### Bài 3 — ba dòng log JSON có cùng mã request
`curl -i -H "x-request-id: req-123" -X POST localhost:3000/posts -d '{"title":"Quat dien","price":250000}'` → `201 Created`, phản hồi có header `x-request-id: req-123`. Server in:

```json
{"time":"2026-11-26T10:26:57.236Z","level":"info","msg":"bắt đầu request","requestId":"req-123","method":"POST","url":"/posts"}
{"time":"2026-11-26T10:26:57.238Z","level":"info","msg":"đã tạo tin","requestId":"req-123","postId":"p9"}
{"time":"2026-11-26T10:26:57.239Z","level":"info","msg":"kết thúc request","requestId":"req-123","status":201,"durationMs":3}
```

Cả ba dòng cùng `requestId = req-123`, dù dòng giữa do service ghi. Service không nhận `requestId` qua tham số: `AsyncLocalStorage` gắn mã vào cả chuỗi xử lý bất đồng bộ của request.

Với `LOG_LEVEL=warn`, `GET /posts/p99` chỉ in một dòng:
```json
{"time":"…","level":"warn","msg":"POST_NOT_FOUND","requestId":"…","status":404}
```
còn `GET /posts` không in gì.

### Bài 4 — thời gian và số lần retry (`GET /posts/:id/shipping`)
| Lời gọi | Kết quả | Thời gian | Số lần retry |
|---|---|---|---|
| `p1` lần 1 | 200, `fee: 30000` | ~0,46 s | 2 (`delayMs` 100, 200) |
| `p1` lần 2 | 200, `fee: 30000` | ~0,05 s | 0 |
| `p8` (dịch vụ hỏng hẳn) | 200, `fee: null`, `degraded: true` | ~0,91 s | 3 (`delayMs` 100, 200, 400) |
| `abc` (lỗi vĩnh viễn) | 400 `INVALID_POST_ID` | ~0,05 s | 0 |

- **Hai lần gọi `p1`:** lần đầu dịch vụ lỗi `ECONNRESET` hai lần rồi thành công, nên mất ~0,46 s (50 + 100 + 50 + 200 + 50 ms). Lần hai dịch vụ đã ổn, chỉ mất ~0,05 s và không retry.
- **Trường hợp dịch vụ hỏng (`p8`):** dịch vụ luôn lỗi tạm thời. Sau 3 lần retry (độ trễ 100, 200, 400 ms; tổng ~0,91 s) route không báo lỗi 5xx mà trả `200` với `fee: null, degraded: true`, để trang vẫn hiển thị được nhưng không có phí vận chuyển.
- **Lỗi vĩnh viễn (`abc`):** `E_BAD_REQUEST` thử lại cũng vô ích nên không retry, trả `400 INVALID_POST_ID` ngay.
