// Lắp ráp các phần và đọc cấu hình.
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { logger, setLogLevel } from './logger.js';
import { createPostRepository } from './posts/postRepository.js';

const config = loadConfig();
setLogLevel(config.logLevel);
const dataFile = pathToFileURL(path.resolve(import.meta.dirname, '..', config.dataFile));
const repo = await createPostRepository(dataFile);
const server = createApp(repo);

server.listen(config.port, () => logger.info('server khởi động, cổng ' + config.port, { port: config.port }));
