import { createReadStream, createWriteStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { createInterface } from "node:readline";
import path from "node:path";

const dataDir = path.join(import.meta.dirname, "..", "data");
const ordersFile = path.join(dataDir, "orders.ndjson");
const completedFile = path.join(dataDir, "completed.ndjson");

const mode = process.argv[2] ?? "readfile"; // readfile | stream | pipeline

const maxRssMb = () => (process.resourceUsage().maxRSS / 1024).toFixed(0); // maxRSS tính bằng KB

interface Order {
  amount: number;
  status: string;
}

// (a) đọc toàn bộ file vào bộ nhớ
async function byReadFile() {
  const text = await readFile(ordersFile, "utf8");
  let count = 0;
  let revenue = 0;
  for (const line of text.split("\n")) {
    if (!line) continue;
    const order = JSON.parse(line) as Order;
    count++;
    if (order.status === "completed") revenue += order.amount;
  }
  console.log(`${count} đơn, doanh thu ${revenue}, maxRSS ${maxRssMb()} MB`);
}

// (b) đọc từng dòng bằng readline trên createReadStream
async function byStream() {
  const rl = createInterface({ input: createReadStream(ordersFile), crlfDelay: Infinity });
  let count = 0;
  let revenue = 0;
  for await (const line of rl) {
    if (!line) continue;
    const order = JSON.parse(line) as Order;
    count++;
    if (order.status === "completed") revenue += order.amount;
  }
  console.log(`${count} đơn, doanh thu ${revenue}, maxRSS ${maxRssMb()} MB`);
}

// (c) pipeline + async generator lọc đơn completed ghi ra completed.ndjson
async function byPipeline() {
  async function* onlyCompleted(source: AsyncIterable<string>) {
    let rest = "";
    for await (const chunk of source) {
      const lines = (rest + chunk).split("\n");
      rest = lines.pop()!; // dòng dở dang chuyển sang chunk sau
      for (const line of lines) {
        if (line && (JSON.parse(line) as Order).status === "completed") yield line + "\n";
      }
    }
    if (rest && (JSON.parse(rest) as Order).status === "completed") yield rest + "\n";
  }

  await pipeline(
    createReadStream(ordersFile, { encoding: "utf8" }),
    onlyCompleted,
    createWriteStream(completedFile),
  );

  const { size } = await stat(completedFile);
  let lines = 0;
  for await (const _ of createInterface({ input: createReadStream(completedFile) })) lines++;
  console.log(`completed.ndjson: ${lines} dòng, ${(size / 1024 / 1024).toFixed(1)} MB, maxRSS ${maxRssMb()} MB`);
}

if (mode === "stream") await byStream();
else if (mode === "pipeline") await byPipeline();
else await byReadFile();
