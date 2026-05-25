import { createPluginInstance } from "@testforge/vue-test-core";
import { createRouter } from "vue-router";

import type { Router } from "vue-router";
import type { RouterPluginOptions } from "./types";
import type { RuntimePluginOptions } from "@testforge/vue-test-core";

/*
 * Creates a Vue Router plugin instance.
 *
 * Extracted into a separate factory to simplify testing and mocking.
 */
export function createRouterPlugin(
  options: RuntimePluginOptions<Router, RouterPluginOptions>,
): Router {
  return createPluginInstance<Router, RouterPluginOptions>(createRouter, options);
}
