import { createPluginInstance } from "@testforgejs/vue-test-core";
import { createTestingPinia } from "@pinia/testing";

import { MOCK_STORES } from "../constants/constants.js";

import type { TestingPinia } from "@pinia/testing";
import type { VueTestPiniaOptions } from "../types/types";

/*
 * Resolves a testing Pinia instance and applies optional store setup.
 *
 * Store setup runs for both newly created instances and existing instances
 * reused through __meta.instance.
 */
export function createPiniaPlugin(options: VueTestPiniaOptions): TestingPinia {
  const { [MOCK_STORES]: mockStores, ...pluginOptions } = options;

  const pinia = createPluginInstance<TestingPinia, VueTestPiniaOptions>(
    createTestingPinia,
    pluginOptions,
  );

  if (mockStores) {
    mockStores(pinia);
  }

  return pinia;
}
