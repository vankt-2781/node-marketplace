import { loadOrders, totalRevenue } from "./orders.js";

const orders = loadOrders();
console.log(`số đơn: ${orders.length} | doanh thu: ${totalRevenue(orders)}`);
