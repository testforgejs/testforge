import { createPluginInstance } from "@testforge/vue-test-core";
import { createRouter } from "vue-router";

import type { Router } from "vue-router";
import type { VueTestRouterOptions } from "../types/types";
import type { PluginOptionsWithMeta } from "@testforge/vue-test-core";

/*
 * Creates a Vue Router plugin instance.
 *
 * Extracted into a separate factory to simplify testing and mocking.
 */
export function createRouterPlugin(
  options: PluginOptionsWithMeta<Router, VueTestRouterOptions>,
): Router {
  return createPluginInstance<Router, VueTestRouterOptions>(createRouter, options);
}
