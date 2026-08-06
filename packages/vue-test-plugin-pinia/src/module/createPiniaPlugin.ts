import { createPluginInstance } from "@testforgejs/vue-test-core";
import { createTestingPinia } from "@pinia/testing";

import type { Pinia } from "pinia";
import type { VueTestPiniaOptions } from "../types/types";

/*
 * Factory for creating a Pinia Testing plugin instance.
 */
export function createPiniaPlugin(options: VueTestPiniaOptions): Pinia {
  const pinia = createPluginInstance<Pinia, VueTestPiniaOptions>(createTestingPinia, options);
  if (options.mockStores) {
    options.mockStores(pinia);
  }
  return pinia;
}
