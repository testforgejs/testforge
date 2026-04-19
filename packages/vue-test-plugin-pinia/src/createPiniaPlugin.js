import { createPluginInstance } from "@testforge/vue-test-core";
import { setActivePinia } from "pinia";
import { createTestingPinia } from "@pinia/testing";

/**
 * Factory for creating a Pinia Testing plugin instance.
 * Automatically sets the active Pinia instance for current test context.
 *
 * @param {PiniaPluginOptions} [options={}] - Configuration for Pinia testing.
 * @returns {import('@pinia/testing').TestingPinia}
 */
export function createPiniaPlugin(options = {}) {
  const pinia = createPluginInstance(createTestingPinia, options);
  setActivePinia(pinia);
  if (!options.__sharedInstance && options.mockStores) {
    options.mockStores(pinia);
  }
  return pinia;
}
