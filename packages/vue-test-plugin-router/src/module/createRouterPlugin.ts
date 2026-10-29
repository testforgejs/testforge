import { createPluginInstance } from "@testforgejs/vue-test-core";
import { createRouter } from "vue-router";

import type { Router, RouterOptions } from "vue-router";
import type { RouterRuntimeOptions } from "../types/types.js";

/*
 * Creates or reuses a managed Vue Router instance.
 *
 * Internal TestForge controls are excluded from the native
 * createRouter() options by createPluginInstance().
 */
export function createRouterPlugin(options: RouterRuntimeOptions): Router {
  return createPluginInstance<Router, RouterOptions>(createRouter, options);
}
