import { createRouterPlugin } from "./createRouterPlugin.js";

import type { Router } from "vue-router";
import type { VueTestRouterOptions } from "../types/types";
import type { PluginModule } from "@testforge/vue-test-core";

/*
 * Vue Router plugin module definition.
 */
export const routerPlugin: PluginModule<Router, VueTestRouterOptions> = {
  getName: () => "router",
  getDefinition: () => ({
    create: createRouterPlugin,
  }),
};
