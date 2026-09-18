import type { PluginDefaultOptionsFactory } from "@testforgejs/vue-test-core";
import type { VueTestRouterOptions } from "./types/types";

import { createMemoryHistory, createWebHistory } from "vue-router";

/**
 * Creates the default Vue Router options used by TestForge.
 *
 * Uses web history when a browser environment is available and falls back
 * to memory history in non-browser environments. A minimal root route is
 * included so the router can be created without requiring project-specific
 * route configuration.
 *
 * @returns A factory that creates the default Vue Router options.
 */
export const defaultOptions: PluginDefaultOptionsFactory<VueTestRouterOptions> = () => () => ({
  history: typeof window !== "undefined" ? createWebHistory() : createMemoryHistory(),
  routes: [{ path: "/", component: { render: () => null } }],
});
