import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    // environment: "node",
    include: ["**/*.vitest.test.js", "**/*.int.test.js"],
  },
  resolve: {
    alias: [
      {
        find: /^@testforge\/(.*)$/,
        replacement: path.resolve(__dirname, "packages/$1/src"),
      },
    ],
  },
  // resolve: {
  //   alias: {
  //     "@testforge/vue-test-plugin-pinia": path.resolve(
  //       __dirname,
  //       "packages/vue-test-plugin-pinia/src",
  //     ),
  //     "@testforge/vue-test-plugin-i18n": path.resolve(
  //       __dirname,
  //       "packages/vue-test-plugin-i18n/src",
  //     ),
  //     "@testforge/vue-test-plugin-router": path.resolve(
  //       __dirname,
  //       "packages/vue-test-plugin-router/src",
  //     ),
  //     "@testforge/vue-test-core": path.resolve(
  //       __dirname,
  //       "packages/vue-test-core/src",
  //     ),
  //   },
  // },
});
