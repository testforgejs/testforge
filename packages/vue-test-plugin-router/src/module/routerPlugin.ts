import { createRouterPlugin } from "./createRouterPlugin.js";
import { defaultOptions } from "../defaults.js";

import type { Router } from "vue-router";
import type { VueTestRouterOptions } from "../types/types";
import type { PluginModuleWithDefaults } from "@testforgejs/vue-test-core";

/**
 * A Vue Router plugin module for the TestForge testing framework.
 */
export const routerPlugin: PluginModuleWithDefaults<Router, VueTestRouterOptions> = {
  getName: () => "router",
  getDefinition: () => ({
    create: createRouterPlugin,
  }),
  getDefaultOptions: defaultOptions,
};
