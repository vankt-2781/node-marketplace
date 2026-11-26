import { performance } from "node:perf_hooks";
import pLimit from "p-limit";
import { checkMarketPrice, concurrency } from "./services.js";

const ids = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"];

// (c) tự viết, không dùng thư viện: trả kết quả theo dạng của Promise.allSettled
async function runWithLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < tasks.length) {
      const i = next++;
      try {
        results[i] = { status: "fulfilled", value: await tasks[i]() };
      } catch (reason) {
        results[i] = { status: "rejected", reason };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

async function measure(label: string, run: () => Promise<PromiseSettledResult<number>[]>) {
  const t0 = performance.now();
  const results = await run();
  const ms = Math.round(performance.now() - t0);
  const ok = results.filter((r) => r.status === "fulfilled").length;
  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => (r.reason as Error).message);
  console.log(`${label}: ${ok} thành công | lỗi: ${errors.join(", ")} | concurrency.peak = ${concurrency.peak} | ${ms} ms`);
  concurrency.peak = 0;
}

// (a) không giới hạn
await measure("(a) allSettled", () => Promise.allSettled(ids.map((id) => checkMarketPrice(id))));

// (b) pLimit(3)
const limit = pLimit(3);
await measure("(b) pLimit(3)", () => Promise.allSettled(ids.map((id) => limit(() => checkMarketPrice(id)))));

// (c) runWithLimit giới hạn 3
await measure("(c) runWithLimit(3)", () => runWithLimit(ids.map((id) => () => checkMarketPrice(id)), 3));
