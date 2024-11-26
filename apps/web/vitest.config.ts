/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['src/tests/client/target-chain/bitcoin/**/*.test.ts'],
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'ecies-wasm': path.resolve(__dirname, '../../node_modules/ecies-wasm/lib/node.js'),
    },
  },
  plugins: [],
}); 