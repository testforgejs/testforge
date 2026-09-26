import type { PluginDefaultOptionsFactory } from "@testforgejs/vue-test-core";
import type { VueTestRouterOptions } from "./types/types";

import { createMemoryHistory } from "vue-router";

/**
 * Creates the default Vue Router options used by TestForge.
 *
 * Uses in-memory history to keep routing isolated from the browser environment
 * and an empty route table to avoid introducing project-specific routes.
 *
 * @returns A factory that creates the default Vue Router options.
 */
export const defaultOptions: PluginDefaultOptionsFactory<VueTestRouterOptions> = () => () => ({
  history: createMemoryHistory(),
  routes: [],
});
