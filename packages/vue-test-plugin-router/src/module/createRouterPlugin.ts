import { createPluginInstance } from "@testforgejs/vue-test-core";
import { createRouter } from "vue-router";

import type { Router } from "vue-router";
import type { VueTestRouterOptions } from "../types/types";

/*
 * Creates a Vue Router plugin instance.
 *
 * Extracted into a separate factory to simplify testing and mocking.
 */
export function createRouterPlugin(options: VueTestRouterOptions): Router {
  return createPluginInstance<Router, VueTestRouterOptions>(createRouter, options);
}
