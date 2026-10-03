import { createPluginInstance } from "@testforgejs/vue-test-core";
import { createTestingPinia } from "@pinia/testing";

import type { TestingPinia } from "@pinia/testing";
import type { VueTestPiniaOptions } from "../types/types";

/*
 * Factory for creating a Pinia testing plugin instance.
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
