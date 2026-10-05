import { expectError, expectType } from "tsd";

import "../dist/index.js";

import type { PluginInstanceMap, PluginOptionsMap } from "@testforgejs/vue-test-core";
import type { VueTestPrimeVueOptions } from "../dist/index.js";

/*
 * Module augmentation should register the `primevueV3`
 * configuration type in PluginOptionsMap.
 */
declare const pluginOptionsMap: PluginOptionsMap;

expectType<VueTestPrimeVueOptions>(pluginOptionsMap.primevueV3);

expectError(pluginOptionsMap.primevueV33);

/*
 * PrimeVue 3 is install-based and does not register
 * a runtime instance type in PluginInstanceMap.
 */
declare const pluginInstanceMap: PluginInstanceMap;

expectError(pluginInstanceMap.primevueV3);
