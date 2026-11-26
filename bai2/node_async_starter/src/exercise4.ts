import { performance } from "node:perf_hooks";
import { getShippingFee } from "./services.js";

const t0 = performance.now();
const ms = () => `${Math.round(performance.now() - t0)} ms`;

// in thời điểm tiến trình kết thúc
process.on("exit", () => console.log(`tiến trình kết thúc lúc ${ms()}`));

const mode = process.argv[2] ?? "timeout"; // timeout | race | abort

try {
  if (mode === "race") {
    // (b) đặt thời hạn bằng Promise.race với timer 500 ms (lời gọi gốc vẫn chạy tiếp)
    const deadline = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), 500),
    );
    await Promise.race([getShippingFee("p3"), deadline]);
  } else if (mode === "abort") {
    // (c) AbortController, abort() sau 200 ms
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 200);
    try {
      await getShippingFee("p3", { signal: controller.signal });
    } catch (err) {
      console.log(`lỗi ${(err as Error).name}, lý do ${controller.signal.reason.name} lúc ${ms()}`);
    }
  } else {
    // (a) AbortSignal.timeout(500)
    const signal = AbortSignal.timeout(500);
    try {
      await getShippingFee("p3", { signal });
    } catch (err) {
      console.log(`lỗi ${(err as Error).name}, lý do ${signal.reason.name} lúc ${ms()}`);
    }
  }
} catch (err) {
  // (b) lỗi từ Promise.race
  console.log(`lỗi ${(err as Error).message} lúc ${ms()}`);
}
