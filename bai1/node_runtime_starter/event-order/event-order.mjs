import path from "node:path";

const file = path.basename(import.meta.filename);
const log = (label) => console.log(label, `(${file})`);

log("A"); // đồng bộ

setTimeout(() => {
  log("D"); // timers

  setImmediate(() => log("G")); // check: chạy ngay sau timers của vòng này

  setTimeout(() => {
    log("H"); // timers của vòng sau
    setTimeout(() => log("E"), 0); // vòng sau nữa
    process.nextTick(() => log("F")); // chạy ngay khi H kết thúc, trước E
  }, 0);
}, 0);

process.nextTick(() => log("B")); // hàng đợi nextTick
Promise.resolve().then(() => log("C")); // hàng đợi microtask (promise)

log("I"); // đồng bộ

/*
 * DỰ ĐOÁN (ghi trước khi chạy), ESM: A, I, C, B, D, G, H, F, E
 * - A, I: code đồng bộ chạy trước.
 * - C trước B: trong ES module, code chạy bên trong một promise job nên microtask (promise) được xả trước nextTick.
 * - D: setTimeout 0 (pha timers), G: setImmediate đặt trong D (pha check cùng vòng).
 * - H: setTimeout lồng, chạy vòng sau; F (nextTick) chạy ngay sau H, trước E (timer vòng kế tiếp).
 *
 * KẾT QUẢ (b) chạy .mjs: A, I, C, B, D, G, H, F, E
 * KẾT QUẢ (c) chạy .cjs: A, I, B, C, D, G, H, F, E
 * Chỉ B và C đổi chỗ: CommonJS xả nextTick trước microtask, ES module thì ngược lại. F luôn trước E.
 */
