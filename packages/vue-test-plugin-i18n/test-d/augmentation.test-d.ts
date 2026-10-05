import { expectError, expectType } from "tsd";

import "../dist/index.js";

import type { PluginInstanceMap, PluginOptionsMap } from "@testforgejs/vue-test-core";
import type { I18n } from "vue-i18n";
import type { VueTestI18nOptions } from "../dist/index.js";

/*
 * Module augmentation should register the `i18n`
 * configuration type in PluginOptionsMap.
 */
declare const pluginOptionsMap: PluginOptionsMap;

expectType<VueTestI18nOptions>(pluginOptionsMap.i18n);

expectError(pluginOptionsMap.i19n);

/*
 * Module augmentation should register the `i18n`
 * runtime instance type in PluginInstanceMap.
 */
declare const pluginInstanceMap: PluginInstanceMap;

expectType<I18n>(pluginInstanceMap.i18n);

expectError(pluginInstanceMap.i19n);
