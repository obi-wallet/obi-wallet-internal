import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    setupFiles: ["dotenv/config", "./vitest.setup"],
    testTimeout: 30_000,
    mockReset: true,
    clearMocks: true,
    globals: true,
    include: ["**/__tests__/**", "**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    exclude: ["**/__tests-e2e__/**"],
    alias: {
      "lottie-react": path.resolve("./mocks/empty"),
      "next/font/google": path.resolve("./src/__mocks__/next/font/google"),
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
