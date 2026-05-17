import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  external: [
    "vue",
    "pinia",
    "vue-i18n",
    "vue-router",
    "@vue/test-utils",
    "@pinia/testing",
    /^@testforge\/.*/,
  ],
});
