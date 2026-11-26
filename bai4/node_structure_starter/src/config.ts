// Đọc và kiểm tra cấu hình từ biến môi trường. Sai thì in danh sách lỗi và thoát mã 1.
import type { LogLevel } from './logger.js';

const LOG_LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error'];

export interface Config {
  port: number;
  dataFile: string;
  logLevel: LogLevel;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const errors: string[] = [];

  const rawPort = env.PORT ?? '3000';
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push(`PORT không hợp lệ: '${rawPort}' (cần số nguyên 1-65535)`);
  }

  const dataFile = env.DATA_FILE || 'data/posts.json';

  const rawLevel = env.LOG_LEVEL ?? 'info';
  if (!(LOG_LEVELS as readonly string[]).includes(rawLevel)) {
    errors.push(`LOG_LEVEL không hợp lệ: '${rawLevel}' (một trong ${LOG_LEVELS.join(', ')})`);
  }

  if (errors.length > 0) {
    for (const e of errors) console.error(e);
    process.exit(1);
  }
  return { port, dataFile, logLevel: rawLevel as LogLevel };
}
