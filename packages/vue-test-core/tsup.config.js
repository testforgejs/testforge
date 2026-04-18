import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.js"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  // Automatically marks ALL dependencies from package.json as external
  external: [
    "vue",
    "pinia",
    "vue-router",
    "@vue/test-utils",
    "@pinia/testing",
    /^@testforge\/.*/, // This is the most important thing for a monorepository
  ],
});
