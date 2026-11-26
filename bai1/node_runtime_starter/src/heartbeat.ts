import { performance } from "node:perf_hooks";

export interface Heartbeat {
  stop: () => void;
  maxLag: () => number; // ms
}

// Nhịp tim: cứ intervalMs lại tick một lần; độ trễ = thời điểm tick thực tế - thời điểm dự kiến.
export function startHeartbeat(intervalMs = 1000): Heartbeat {
  let last = performance.now();
  let max = 0;
  const timer = setInterval(() => {
    const now = performance.now();
    max = Math.max(max, now - last - intervalMs);
    last = now;
  }, intervalMs);
  return { stop: () => clearInterval(timer), maxLag: () => Math.max(0, max) };
}
