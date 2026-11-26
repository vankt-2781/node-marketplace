/**
 * Độ trễ (ghi sau khi chạy):
 *  - getOrderStats(5_000_000) chạy đồng bộ: thời gian tính = ~1100 ms
 *  - độ trễ lớn nhất của heartbeat = ~1100 ms
 * Chênh lệch: lệch chỉ vài ms. getOrderStats chạy đồng bộ nên chiếm trọn event loop, các tick của heartbeat bị dồn lại đến khi hàm trả về,
 * vì vậy lag ≈ thời gian tính (thấp hơn tối đa một nhịp 100 ms tuỳ lúc hàm bắt đầu so với tick trước). Với "wait" (bất đồng bộ) event loop rảnh nên lag chỉ 0-3 ms.
 */
import { setTimeout as sleep } from "node:timers/promises";
import { startHeartbeat } from "./heartbeat.js";
import { getOrderStats } from "./orders.js";

const hb = startHeartbeat(100);
await sleep(300);

if (process.argv[2] === "wait") {
  // (b) chờ bất đồng bộ: event loop không bị chặn
  await sleep(700);
  console.log("đã chờ 700 ms (bất đồng bộ)");
} else {
  // (a) tính đồng bộ: chặn event loop
  const { revenue, elapsedMs } = getOrderStats(5_000_000);
  console.log(`doanh thu: ${revenue} | thời gian tính: ${elapsedMs} ms`);
}

await sleep(300);
console.log(`độ trễ lớn nhất: ${hb.maxLag().toFixed(0)} ms`);
hb.stop();
