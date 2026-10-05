import { expectError, expectType } from "tsd";

import "../dist/index.js";

import type { PluginInstanceMap, PluginOptionsMap } from "@testforgejs/vue-test-core";
import type { TestingPinia } from "@pinia/testing";
import type { VueTestPiniaOptions } from "../dist/index.js";

/*
 * Module augmentation should register the `pinia`
 * configuration type in PluginOptionsMap.
 */
declare const pluginOptionsMap: PluginOptionsMap;

expectType<VueTestPiniaOptions>(pluginOptionsMap.pinia);

expectError(pluginOptionsMap.piniaa);

/*
 * Module augmentation should register the `pinia`
 * runtime instance type in PluginInstanceMap.
 */
declare const pluginInstanceMap: PluginInstanceMap;

expectType<TestingPinia>(pluginInstanceMap.pinia);

expectError(pluginInstanceMap.piniaa);
