// Mỗi dòng log là một JSON: time, level, msg, requestId (nếu đang trong request) và các trường thêm.
import { requestContext } from './requestContext.js';

const LEVELS = ['debug', 'info', 'warn', 'error'] as const;
export type LogLevel = (typeof LEVELS)[number];

let threshold: LogLevel = 'info';

export function setLogLevel(level: LogLevel): void {
  threshold = level;
}

function write(level: LogLevel, msg: string, extra: Record<string, unknown> = {}): void {
  if (LEVELS.indexOf(level) < LEVELS.indexOf(threshold)) return;
  const requestId = requestContext.getStore()?.requestId;
  console.log(JSON.stringify({ time: new Date().toISOString(), level, msg, requestId, ...extra }));
}

export const logger = {
  debug: (msg: string, extra?: Record<string, unknown>) => write('debug', msg, extra),
  info: (msg: string, extra?: Record<string, unknown>) => write('info', msg, extra),
  warn: (msg: string, extra?: Record<string, unknown>) => write('warn', msg, extra),
  error: (msg: string, extra?: Record<string, unknown>) => write('error', msg, extra),
};
