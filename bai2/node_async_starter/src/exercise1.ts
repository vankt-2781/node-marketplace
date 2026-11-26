import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { findPostCallback, type Post } from "./services.js";

// (a) promisify bọc callback thành Promise
const findPost = promisify(findPostCallback) as (id: string) => Promise<Post>;

const p2 = await findPost("p2");
console.log(p2.title, p2.price);

// (b) lỗi không tìm thấy
try {
  await findPost("p99");
} catch (err) {
  console.log((err as Error).message);
}

// (c) đọc file bằng readFile của node:fs/promises, đường dẫn tạo từ import.meta.url
const text = await readFile(new URL("../data/posts.json", import.meta.url), "utf8");
const posts = JSON.parse(text) as Post[];
console.log(posts.filter((p) => p.status === "available").length);
