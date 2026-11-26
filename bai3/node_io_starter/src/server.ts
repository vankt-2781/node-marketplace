import { createServer, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

interface Post {
  id: string;
  title: string;
  price: number;
  status: string;
  sellerId: string;
}

const postsFile = path.join(import.meta.dirname, "..", "data", "posts.json");
const posts = JSON.parse(await readFile(postsFile, "utf8")) as Post[];

function send(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  const detail = pathname.match(/^\/posts\/([^/]+)$/);

  // (a) GET /posts, GET /posts/:id
  if (req.method === "GET" && pathname === "/posts") {
    return send(res, 200, posts.filter((p) => p.status === "available"));
  }
  if (req.method === "GET" && detail) {
    const post = posts.find((p) => p.id === detail[1]);
    return post ? send(res, 200, post) : send(res, 404, { error: "POST_NOT_FOUND" });
  }

  // Bài 4 (a): route chậm, chờ 2 giây rồi trả báo cáo
  if (req.method === "GET" && pathname === "/report") {
    await new Promise((r) => setTimeout(r, 2000));
    return send(res, 200, { report: "done" });
  }

  // (b) POST /posts
  if (req.method === "POST" && pathname === "/posts") {
    let raw = "";
    for await (const chunk of req) raw += chunk; // đọc body bằng for await

    let body: { title?: unknown; price?: unknown; sellerId?: unknown };
    try {
      body = JSON.parse(raw);
    } catch {
      return send(res, 400, { error: "INVALID_JSON" });
    }

    // QT5: tiêu đề không rỗng, giá là số nguyên dương (VND)
    const { title, price } = body ?? {};
    if (
      typeof title !== "string" || title.trim() === "" ||
      typeof price !== "number" || !Number.isInteger(price) || price <= 0
    ) {
      return send(res, 400, { error: "QT5_VIOLATION" });
    }

    const post: Post = {
      id: `p${posts.length + 1}`,
      title,
      price,
      status: "available",
      sellerId: typeof body.sellerId === "string" ? body.sellerId : "u1",
    };
    posts.push(post);
    return send(res, 201, post);
  }

  send(res, 404, { error: "NOT_FOUND" });
});

server.listen(3000, () => console.log("server chạy ở http://localhost:3000"));

// Bài 4 (b): tắt server có kiểm soát
function shutdown(signal: string): void {
  console.log(`nhận ${signal}, ngừng nhận kết nối mới, chờ các yêu cầu đang chạy...`);
  server.close(() => {
    console.log("đã đóng xong, thoát");
    process.exit(0);
  });
  // hạn chót 5 giây; unref để timer không giữ tiến trình sống
  setTimeout(() => {
    console.log("quá hạn 5 giây, thoát bắt buộc");
    process.exit(1);
  }, 5000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
