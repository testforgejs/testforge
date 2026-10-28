import { createPluginInstance } from "@testforgejs/vue-test-core";
import { createTestingPinia } from "@pinia/testing";

import { MOCK_STORES } from "../constants/constants.js";

import type { TestingPinia, TestingOptions } from "@pinia/testing";
import type { PiniaRuntimeOptions } from "../types/types";

/*
 * Resolves a testing Pinia instance and applies optional store setup.
 *
 * Store setup runs for both newly created instances and pre-created instances
 * reused through withPluginInstance().
 */
export function createPiniaPlugin(options: PiniaRuntimeOptions): TestingPinia {
  const { [MOCK_STORES]: mockStores, ...pluginOptions } = options;

  const pinia = createPluginInstance<TestingPinia, TestingOptions>(
    createTestingPinia,
    pluginOptions,
  );

  if (mockStores) {
    mockStores(pinia);
  }

  return pinia;
}
