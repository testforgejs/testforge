import { createRouterPlugin } from "./createRouterPlugin.js";
import { defaultOptions } from "../defaults.js";
import { ROUTER_PLUGIN_NAME } from "../constants/constants.js";

import type { Router } from "vue-router";
import type { VueTestRouterOptions } from "../types/types.js";
import type { PluginModuleWithDefaults } from "@testforgejs/vue-test-core";

/**
 * Managed Vue Router plugin module for TestForge.
 *
 * Provides the runtime definition for creating or reusing Vue Router
 * instances and exposes a default configuration factory
 * that presets can explicitly opt into.
 */
export const routerPlugin: PluginModuleWithDefaults<Router, VueTestRouterOptions> = {
  getName: () => ROUTER_PLUGIN_NAME,
  getDefinition: () => ({
    create: createRouterPlugin,
    supportsInstanceReferences: true,
  }),
  getDefaultOptions: defaultOptions,
};
