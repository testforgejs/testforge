import type { Router, RouterOptions } from "vue-router";
import type { PluginControlOptions } from "@testforge/vue-test-core";

export interface RouterPluginOptions extends RouterOptions, PluginControlOptions<Router> {}
