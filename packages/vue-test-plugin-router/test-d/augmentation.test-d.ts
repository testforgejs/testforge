import { expectError, expectType } from "tsd";

import "../dist/index.js";

import type { PluginInstanceMap, PluginOptionsMap } from "@testforgejs/vue-test-core";
import type { Router } from "vue-router";
import type { VueTestRouterOptions } from "../dist/index.js";

/*
 * Module augmentation should register the `router`
 * configuration type in PluginOptionsMap.
 */
declare const pluginOptionsMap: PluginOptionsMap;

expectType<VueTestRouterOptions>(pluginOptionsMap.router);

expectError(pluginOptionsMap.routerr);

/*
 * Module augmentation should register the `router`
 * runtime instance type in PluginInstanceMap.
 */
declare const pluginInstanceMap: PluginInstanceMap;

expectType<Router>(pluginInstanceMap.router);

expectError(pluginInstanceMap.routerr);
