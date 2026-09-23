import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],

  test: {
    globals: true,
    include: ["**/*.vitest.test.js", "**/*.vitest.test.cjs", "**/*.test.ts", "**/*.int.test.js"],

    typecheck: {
      enabled: true,
      include: ["**/*.type-spec.ts", "**/*.test.ts"],
    },

    server: {
      deps: {
        inline: [
          "vuetify",
          "@testforgejs/vue-test-plugin-vuetify",
          "@testforgejs/vue-test-plugin-primevue-v3",
        ],
      },
    },
  },
});
