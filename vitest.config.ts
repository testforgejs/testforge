import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    // environment: "node",
    include: ["**/*.vitest.test.js", "**/*.vitest.test.cjs", "**/*.test.ts", "**/*.int.test.js"],
    typecheck: {
      enabled: true,
      include: ["**/*.type-spec.ts", "**/*.test.ts"],
    },
  },
  resolve: {
    alias: [
      {
        find: /^@testforgejs\/(.*)$/,
        replacement: path.resolve(import.meta.dirname, "packages/$1/src"),
      },
    ],
  },
});
