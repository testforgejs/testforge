import { createRouterPlugin } from "./createRouterPlugin.js";

import type { Router } from "vue-router";
import type { VueTestRouterOptions } from "../types/types";
import type { PluginModule } from "@testforge/vue-test-core";

/**
 * A Vue Router plugin module for the TestForge testing framework.
 */
export const routerPlugin: PluginModule<Router, VueTestRouterOptions> = {
  getName: () => "router",
  getDefinition: () => ({
    create: createRouterPlugin,
  }),
};
