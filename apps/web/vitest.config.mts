import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    setupFiles: ["./vitest.setup"],
    include: ["**/__tests__/**", "**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    exclude: ["**/__tests-e2e__/**"],
    alias: {
      "lottie-react": path.resolve("./mocks/empty"),
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
