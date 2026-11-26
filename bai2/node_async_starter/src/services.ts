import { readFile } from "node:fs";
import { readFile as readFile_ } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";

export type PostStatus = "available" | "reserved" | "sold";

export interface Post {
  id: string;
  title: string;
  // QT5 — giá tiền: giá là số nguyên dương, đơn vị VND.
  price: number;
  status: PostStatus;
  sellerId: string;
}

export type Callback<T> = (err: Error | null, result?: T) => void;

const POSTS_PATH = new URL("../data/posts.json", import.meta.url);

// Kiểu callback (error-first). Lỗi không tìm thấy: "POST_NOT_FOUND: <id>".
export function findPostCallback(id: string, cb: Callback<Post>): void {
  readFile(POSTS_PATH, "utf8", (err, text) => {
    if (err) return cb(err);
    const posts = JSON.parse(text) as Post[];
    const post = posts.find((p) => p.id === id);
    if (!post) return cb(new Error(`POST_NOT_FOUND: ${id}`));
    cb(null, post);
  });
}

// ---- Bài 2: các dịch vụ giả lập có độ trễ ----
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ~40 ms
export async function findPost(id: string): Promise<Post> {
  await sleep(40);
  const posts = JSON.parse(await readFile_(POSTS_PATH, "utf8")) as Post[];
  const post = posts.find((p) => p.id === id);
  if (!post) throw new Error(`POST_NOT_FOUND: ${id}`);
  return post;
}

const SELLERS: Record<string, string> = {
  u1: "Nguyen Van An",
  u2: "Tran Thi Binh",
  u3: "Le Van Cuong",
};

// ~80 ms (riêng u3 ~40 ms)
export async function getSellerName(sellerId: string): Promise<string> {
  await sleep(sellerId === "u3" ? 40 : 80);
  const name = SELLERS[sellerId];
  if (!name) throw new Error(`SELLER_NOT_FOUND: ${sellerId}`);
  return name;
}

const REVIEWS: Record<string, number> = { u1: 12, u2: 7 };

// ~80 ms; u3 lỗi sau ~20 ms
export async function getReviewCount(sellerId: string): Promise<number> {
  if (sellerId === "u3") {
    await sleep(20);
    throw new Error("REVIEW_SERVICE_UNAVAILABLE");
  }
  await sleep(80);
  return REVIEWS[sellerId] ?? 0;
}

// ---- Bài 3: kiểm tra giá thị trường (có đo đồng thời) ----
export const concurrency = { current: 0, peak: 0 };

// ~200 ms; p6 báo lỗi
export async function checkMarketPrice(id: string): Promise<number> {
  concurrency.current++;
  concurrency.peak = Math.max(concurrency.peak, concurrency.current);
  try {
    await sleep(200);
    if (id === "p6") throw new Error(`PRICE_SERVICE_ERROR: ${id}`);
    const posts = JSON.parse(await readFile_(POSTS_PATH, "utf8")) as Post[];
    const post = posts.find((p) => p.id === id);
    if (!post) throw new Error(`POST_NOT_FOUND: ${id}`);
    return post.price;
  } finally {
    concurrency.current--;
  }
}

// ---- Bài 4: phí vận chuyển (~1500 ms, hỗ trợ huỷ bằng AbortSignal) ----
export async function getShippingFee(id: string, opts: { signal?: AbortSignal } = {}): Promise<number> {
  try {
    await delay(1500, undefined, { signal: opts.signal });
  } catch (err) {
    console.log(`[shipping] đã hủy ${id}`);
    throw err; // AbortError, lý do nằm ở signal.reason
  }
  console.log(`[shipping] xong ${id}`);
  return 30_000;
}
