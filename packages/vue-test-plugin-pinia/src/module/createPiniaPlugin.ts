import { createPluginInstance } from "@testforgejs/vue-test-core";
import { createTestingPinia } from "@pinia/testing";

import type { TestingPinia } from "@pinia/testing";
import type { VueTestPiniaOptions } from "../types/types";

/*
 * Creates a testing Pinia instance and applies optional store setup.
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
