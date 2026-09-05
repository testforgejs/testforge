import type { PluginOptionsFactory } from "@testforgejs/vue-test-core";
import type { VueTestRouterOptions } from "@testforgejs/vue-test-plugin-router";

import { createMemoryHistory, createWebHistory } from "vue-router";

export const defaultRouter: PluginOptionsFactory<VueTestRouterOptions> = () => ({
  history: typeof window !== "undefined" ? createWebHistory() : createMemoryHistory(),
  routes: [{ path: "/", component: { render: () => null } }],
});
