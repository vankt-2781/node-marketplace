// index.ts — kiểm tra môi trường, chạy bằng: npm start
import { readFile } from 'node:fs/promises';

const file = new URL('../data/posts.json', import.meta.url);
const posts = JSON.parse(await readFile(file, 'utf8')) as unknown[];

console.log('Node.js', process.version);
const ready = typeof fetch === 'function';
console.log('fetch:', ready ? 'sẵn sàng' : 'thiếu');
console.log('số tin trong data/posts.json:', posts.length);
