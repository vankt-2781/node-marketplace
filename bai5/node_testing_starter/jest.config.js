// jest.config.js — chạy test TypeScript dạng ES module bằng ts-jest.
export default {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  // import './posts.js' trong mã nguồn trỏ tới file posts.ts
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  transform: { '^.+\\.ts$': ['ts-jest', { useESM: true }] },
  collectCoverageFrom: ['src/**/*.ts'],
};
