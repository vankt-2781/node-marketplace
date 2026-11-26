import { performance } from "node:perf_hooks";
import { findPost, getReviewCount, getSellerName } from "./services.js";

const ms = (t0: number) => `${Math.round(performance.now() - t0)} ms`;

// (a) tuần tự
async function detailSequential(id: string) {
  const post = await findPost(id);
  const seller = await getSellerName(post.sellerId);
  const reviews = await getReviewCount(post.sellerId);
  return { post, seller, reviews };
}

// (b) song song: findPost chạy trước, hai lời gọi còn lại gom bằng Promise.all
// (c) trace = true: in thời điểm getSellerName xong
async function detailParallel(id: string, trace = false) {
  const t0 = performance.now();
  const post = await findPost(id);
  const sellerP = getSellerName(post.sellerId).then((name) => {
    if (trace) console.log(`getSellerName xong lúc ${ms(t0)}`);
    return name;
  });
  const [seller, reviews] = await Promise.all([sellerP, getReviewCount(post.sellerId)]);
  return { post, seller, reviews };
}

let t = performance.now();
let r = await detailSequential("p1");
console.log(`(a) ${r.seller}, ${r.reviews} đánh giá, ${ms(t)}`);

t = performance.now();
r = await detailParallel("p1");
console.log(`(b) ${r.seller}, ${r.reviews} đánh giá, ${ms(t)}`);

t = performance.now();
try {
  await detailParallel("p4", true);
} catch (err) {
  console.log(`(c) bắt được ${(err as Error).message} lúc ${ms(t)}`);
}
