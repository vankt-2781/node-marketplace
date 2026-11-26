import { createWriteStream } from "node:fs";
import { once } from "node:events";
import path from "node:path";

// Sinh data/orders.ndjson: 1.000.000 đơn, mỗi dòng một JSON.
// - 249.884 đơn "completed", tổng amount của chúng = 252.656.320.000 (VND, số nguyên dương)
const TOTAL = 1_000_000;
const COMPLETED_TARGET = 252_656_320_000;
const STATUSES = ["pending", "confirmed", "cancelled"] as const;

const isCompleted = (i: number) => i % 4 === 0 && i > 464; // 250000 - 116 = 249884 đơn

// amount của đơn completed: bội số của 1000, đơn cuối được tính bù cho đủ tổng
const amounts = new Map<number, number>();
let sum = 0;
let lastCompleted = 0;
for (let i = 1; i <= TOTAL; i++) {
  if (!isCompleted(i)) continue;
  const amount = (50 + ((i * 7919) % 1900)) * 1000;
  amounts.set(i, amount);
  sum += amount;
  lastCompleted = i;
}
const fix = COMPLETED_TARGET - (sum - amounts.get(lastCompleted)!);
if (!Number.isInteger(fix) || fix <= 0) throw new Error(`amount bù không hợp lệ: ${fix}`);
amounts.set(lastCompleted, fix);

const file = path.join(import.meta.dirname, "..", "data", "orders.ndjson");
const out = createWriteStream(file, { encoding: "utf8" });

for (let i = 1; i <= TOTAL; i++) {
  const completed = isCompleted(i);
  const status = completed ? "completed" : STATUSES[i % 3];
  const amount = completed ? amounts.get(i)! : (20 + ((i * 104729) % 500)) * 1000;
  const line = JSON.stringify({
    id: `o${i}`,
    postId: `p${1 + (i % 8)}`,
    buyerId: `u${1 + (i % 50)}`,
    amount,
    status,
  });
  if (!out.write(line + "\n")) await once(out, "drain");
}
out.end();
await once(out, "finish");
console.log(`đã ghi ${TOTAL} đơn vào ${file}`);
