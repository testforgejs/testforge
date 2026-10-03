import type { TestingPinia, TestingOptions } from "@pinia/testing";
import type { PluginControlOptions } from "@testforgejs/vue-test-core";

/**
 * A callback for configuring Pinia stores after the testing Pinia instance
 * is created and before the component is mounted.
 *
 * Use it to initialize or modify stores required by the test.
 *
 * @param pinia - The testing Pinia instance used by the mounted component.
 */
export type MockStoresFn = (pinia: TestingPinia) => void;

/**
 * Configuration options for the Pinia test plugin.
 *
 * Combines standard Pinia testing configuration (`TestingOptions` from `@pinia/testing`)
 * with TestForge plugin control options.
 *
 * @see {@link TestingOptions} for configuring action stubs, initial state, and Pinia plugins.
 * @see {@link PluginControlOptions} for instance capturing and exposure mechanisms.
 */
export interface VueTestPiniaOptions extends TestingOptions, PluginControlOptions<TestingPinia> {
  /**
   * A callback function to modify the state of stores before a component is mounted.
   *
   * @example
   * ```ts
   * factory({}, {
   *   plugins: {
   *     pinia: {
   *       mockStores: (pinia) => {
   *         const store = useCounterStore(pinia);
   *         store.count = 42;
   *       }
   *     }
   *   }
   * });
   * ```
   */
  mockStores?: MockStoresFn;
}
