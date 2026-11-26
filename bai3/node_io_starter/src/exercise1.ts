import { appendFile, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

// (a) đường dẫn tới thư mục data, không phụ thuộc thư mục chạy lệnh
const dataDir = path.join(import.meta.dirname, "..", "data");
const postsFile = path.join(dataDir, "posts.json");
console.log(path.basename(postsFile), path.extname(postsFile), path.isAbsolute(postsFile));

// (b) ghi tin đang bán ra data/available.json
const posts = JSON.parse(await readFile(postsFile, "utf8")) as { status: string }[];
const list = posts.filter((p) => p.status === "available");
const availableFile = path.join(dataDir, "available.json");
await writeFile(availableFile, JSON.stringify(list, null, 2));
const { size } = await stat(availableFile);
console.log(`available.json có ${list.length} tin, ${size} byte`);

// (c) nối một dòng "thời điểm + số tin" vào data/activity.log
const logFile = path.join(dataDir, "activity.log");
await appendFile(logFile, `${new Date().toISOString()} ${list.length}\n`);
const lines = (await readFile(logFile, "utf8")).split("\n").filter(Boolean).length;
console.log(`activity.log có ${lines} dòng`);
