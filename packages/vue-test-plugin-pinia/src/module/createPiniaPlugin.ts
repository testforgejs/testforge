import { createPluginInstance } from "@testforge/vue-test-core";
import { createTestingPinia } from "@pinia/testing";

import type { Pinia } from "pinia";
import type { VueTestPiniaOptions } from "../types/types";
import type { PluginOptionsWithMeta } from "@testforge/vue-test-core";

/*
 * Factory for creating a Pinia Testing plugin instance.
 */
export function createPiniaPlugin(
  options: PluginOptionsWithMeta<Pinia, VueTestPiniaOptions>,
): Pinia {
  const pinia = createPluginInstance<Pinia, VueTestPiniaOptions>(createTestingPinia, options);
  if (options.mockStores) {
    options.mockStores(pinia);
  }
  return pinia;
}
