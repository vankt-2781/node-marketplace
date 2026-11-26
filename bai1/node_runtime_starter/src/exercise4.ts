import { once } from "node:events";
import { setTimeout as sleep } from "node:timers/promises";
import { Worker } from "node:worker_threads";
import { performance } from "node:perf_hooks";
import { startHeartbeat } from "./heartbeat.js";
import type { OrderStats } from "./orders.js";

const hb = startHeartbeat(100);
await sleep(300);

const start = performance.now();
const worker = new Worker(new URL("./statsWorker.js", import.meta.url), {
  workerData: { count: 5_000_000 },
});
const [stats] = (await once(worker, "message")) as [OrderStats];
const total = Math.round(performance.now() - start);
console.log(`doanh thu: ${stats.revenue} | từ lúc tạo worker đến khi nhận kết quả: ${total} ms`);

await sleep(300);
console.log(`độ trễ lớn nhất: ${hb.maxLag().toFixed(0)} ms`);
hb.stop();
await worker.terminate();
