import type { TestingPinia, TestingOptions } from "@pinia/testing";
import type { PluginControlOptions } from "@testforgejs/vue-test-core";

import { MOCK_STORES } from "../constants/constants.js";

/**
 * A callback for configuring Pinia stores after the testing Pinia
 * instance has been resolved and before the component is mounted.
 *
 * The instance may be newly created or reused through `withPluginInstance()`.
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
 * Use `withMockStores()` to initialize or modify Pinia stores before
 * the component is mounted.
 *
 * The store setup callback runs for both newly created Pinia instances
 * and pre-created instances reused through `withPluginInstance()`.
 *
 * @example
 * ```ts
 * import { withMockStores } from "@testforgejs/vue-test-plugin-pinia";
 *
 * factory({}, {
 *   plugins: {
 *     pinia: {
 *       stubActions: false,
 *       ...withMockStores((pinia) => {
 *         const store = useCounterStore(pinia);
 *         store.count = 42;
 *       }),
 *     },
 *   },
 * });
 * ```
 *
 * @see `TestingOptions` from `@pinia/testing` for native Pinia configuration.
 * @see `PluginControlOptions` from `@testforgejs/vue-test-core`.
 */
export type VueTestPiniaOptions = TestingOptions &
  PluginControlOptions<TestingPinia> & {
    /**
     * Internal callback for configuring Pinia stores before mounting.
     *
     * Use the public `withMockStores()` helper instead of accessing
     * this property directly.
     *
     * The callback runs for both newly created and reused Pinia instances.
     *
     * @internal
     */
    [MOCK_STORES]?: MockStoresFn;
  };
