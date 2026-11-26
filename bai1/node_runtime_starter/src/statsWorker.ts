import { parentPort, workerData } from "node:worker_threads";
import { getOrderStats } from "./orders.js";

const { count } = workerData as { count: number };
parentPort!.postMessage(getOrderStats(count));
