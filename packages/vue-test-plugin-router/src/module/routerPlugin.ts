import { createRouterPlugin } from "./createRouterPlugin.js";
import { defaultOptions } from "../defaults.js";
import { ROUTER_PLUGIN_NAME } from "../constants/constants.js";

import type { Router } from "vue-router";
import type { VueTestRouterOptions } from "../types/types";
import type { PluginModuleWithDefaults } from "@testforgejs/vue-test-core";

/**
 * Managed Vue Router plugin module for TestForge.
 *
 * Provides the runtime definition for creating Vue Router instances
 * and exposes the default configuration used by TestForge-managed presets.
 */
export const routerPlugin: PluginModuleWithDefaults<Router, VueTestRouterOptions> = {
  getName: () => ROUTER_PLUGIN_NAME,
  getDefinition: () => ({
    create: createRouterPlugin,
  }),
  getDefaultOptions: defaultOptions,
};
