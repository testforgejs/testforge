import { createPluginInstance } from "@testforge/vue-test-core";
import { setActivePinia } from "pinia";
import { createTestingPinia } from "@pinia/testing";

import type { Pinia } from "pinia";
import type { VueTestPiniaOptions } from "../types/types";
import type { RuntimePluginOptions } from "@testforge/vue-test-core";

/*
 * Factory for creating a Pinia Testing plugin instance.
 * Automatically sets the active Pinia instance for current test context.
 */
export function createPiniaPlugin(
  options: RuntimePluginOptions<Pinia, VueTestPiniaOptions>,
): Pinia {
  const pinia = createPluginInstance<Pinia, VueTestPiniaOptions>(createTestingPinia, options);
  setActivePinia(pinia);
  if (!options.__sharedInstance && options.mockStores) {
    options.mockStores(pinia);
  }
  return pinia;
}
