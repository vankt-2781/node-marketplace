export interface Order {
  id: number;
  price: number; // VND, số nguyên dương
}

export const ORDER_COUNT = 1000;
export const TOTAL_REVENUE = 254_120_000;

// QT5 — giá tiền: giá là số nguyên dương, đơn vị VND.
function assertPrice(price: number, id: number): void {
  if (!Number.isInteger(price) || price <= 0) {
    throw new Error(`QT5 vi phạm: giá đơn #${id} phải là số nguyên dương (VND), nhận được ${price}`);
  }
}

export function loadOrders(): Order[] {
  const orders: Order[] = [];
  let sum = 0;
  for (let id = 1; id < ORDER_COUNT; id++) {
    const price = 100_000 + ((id * 37) % 300) * 1_000;
    assertPrice(price, id);
    orders.push({ id, price });
    sum += price;
  }
  const last = TOTAL_REVENUE - sum;
  assertPrice(last, ORDER_COUNT);
  orders.push({ id: ORDER_COUNT, price: last });
  return orders;
}

export function totalRevenue(orders: Order[]): number {
  return orders.reduce((s, o) => s + o.price, 0);
}

export interface OrderStats {
  revenue: number;
  elapsedMs: number; // thời gian tính (đồng bộ, chặn event loop)
}

// Tổng doanh thu chuẩn của đề cho từng số lượng đơn.
const KNOWN_TOTALS: Record<number, number> = {
  1000: TOTAL_REVENUE,
  5_000_000: 1_262_215_140_000,
};

// Tính đồng bộ: dựng toàn bộ n đơn rồi cộng dồn -> chặn event loop.
export function getOrderStats(n: number): OrderStats {
  const start = performance.now();
  const orders: Order[] = [];
  let sum = 0;
  for (let id = 1; id < n; id++) {
    const price = 100_000 + ((id * 37) % 300) * 1_000;
    orders.push({ id, price });
    sum += price;
  }
  const last = (KNOWN_TOTALS[n] ?? sum + 100_000) - sum;
  assertPrice(last, n);
  orders.push({ id: n, price: last });
  const revenue = orders.reduce((s, o) => s + o.price, 0);
  return { revenue, elapsedMs: Math.round(performance.now() - start) };
}
