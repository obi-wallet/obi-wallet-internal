import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
    mockReset: true,
    clearMocks: true,
    globals: true,
    deps: {
      moduleDirectories: ["node_modules"],
    },
  },
  resolve: {
    alias: {
      "@": "/src",
      "next/font/google": "/src/__mocks__/next/font/google",
    },
  },
});
