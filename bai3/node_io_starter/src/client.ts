const BASE = "http://localhost:3000";

async function show(label: string, url: string, init?: RequestInit): Promise<void> {
  const res = await fetch(url, init);
  const body = await res.json();
  const shown = Array.isArray(body) ? `${body.length} tin` : JSON.stringify(body);
  console.log(`${label}: status ${res.status} | ok ${res.ok} | ${shown}`);
}

// (e) lời gọi đầu tiên bọc trong try/catch
try {
  await show("GET /posts", `${BASE}/posts`);
} catch (err) {
  const e = err as Error & { cause?: { code?: string } };
  console.log(`${e.name}: ${e.message} | cause.code: ${e.cause?.code}`);
  process.exit(1);
}

// (d)
await show("GET /posts/p99", `${BASE}/posts/p99`);
await show("POST /posts (giá 0)", `${BASE}/posts`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Tin thử", price: 0 }),
});
