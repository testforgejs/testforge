import type { Router, RouterOptions } from "vue-router";
import type { PluginControlOptions } from "@testforge/vue-test-core";

export interface VueTestRouterOptions extends RouterOptions, PluginControlOptions<Router> {}
