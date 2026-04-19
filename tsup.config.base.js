import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.js"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  external: [
    "vue",
    "pinia",
    "vue-router",
    "@vue/test-utils",
    "@pinia/testing",
    /^@testforge\/.*/,
  ],
});
