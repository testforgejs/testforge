import { createPluginInstance } from "@testforgejs/vue-test-core";
import { createTestingPinia } from "@pinia/testing";

import type { TestingPinia } from "@pinia/testing";
import type { VueTestPiniaOptions } from "../types/types";

/*
 * Resolves a testing Pinia instance and applies optional store setup.
 *
 * Store setup runs for both newly created instances and existing instances
 * reused through __meta.instance.
 */
export function createPiniaPlugin(options: VueTestPiniaOptions): TestingPinia {
  const pinia = createPluginInstance<TestingPinia, VueTestPiniaOptions>(
    createTestingPinia,
    options,
  );
  if (options.mockStores) {
    options.mockStores(pinia);
  }
  return pinia;
}
