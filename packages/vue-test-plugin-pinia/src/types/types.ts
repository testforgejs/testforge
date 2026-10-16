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
 * Combines native Pinia testing options with TestForge-specific
 * controls for managed plugin instances and store initialization.
 *
 * Internal instance capture options are handled by TestForge and
 * are not forwarded to the native Pinia testing factory.
 *
 * @see `TestingOptions` from `@pinia/testing` for native Pinia testing configuration.
 * @see `PluginControlOptions` from `@testforgejs/vue-test-core` for type-safe instance capturing.
 */
export interface VueTestPiniaOptions extends TestingOptions, PluginControlOptions<TestingPinia> {
  /**
   * A callback for initializing or modifying Pinia stores after the
   * testing Pinia instance is created and before the component is mounted.
   *
   * @example
   * ```ts
   * factory({}, {
   *   plugins: {
   *     pinia: {
   *       mockStores: (pinia) => {
   *         const store = useCounterStore(pinia);
   *         store.count = 42;
   *       },
   *     },
   *   },
   * });
   * ```
   */
  mockStores?: MockStoresFn;
}
