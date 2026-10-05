import { expectError, expectType } from "tsd";

import "../dist/index.js";

import type { PluginInstanceMap, PluginOptionsMap } from "@testforgejs/vue-test-core";
import type { VueTestVuetifyOptions, VuetifyInstance } from "../dist/index.js";

/*
 * Module augmentation should register the `vuetify`
 * configuration type in PluginOptionsMap.
 */
declare const pluginOptionsMap: PluginOptionsMap;

expectType<VueTestVuetifyOptions>(pluginOptionsMap.vuetify);

expectError(pluginOptionsMap.vuetifyy);

/*
 * Module augmentation should register the `vuetify`
 * runtime instance type in PluginInstanceMap.
 */
declare const pluginInstanceMap: PluginInstanceMap;

expectType<VuetifyInstance>(pluginInstanceMap.vuetify);

expectError(pluginInstanceMap.vuetifyy);
