import type { TestingPinia, TestingOptions } from "@pinia/testing";
import type { RuntimePluginOptions } from "@testforgejs/vue-test-core";

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
 * Extends native Pinia testing options with TestForge-specific
 * store initialization support.
 *
 * Managed instance controls are provided separately by TestForge
 * through its plugin configuration types.
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
 */
export type VueTestPiniaOptions = TestingOptions & {
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

/**
 * Resolved runtime options for the managed Pinia test plugin.
 *
 * Combines {@link VueTestPiniaOptions} with the internal TestForge
 * controls used to create, reuse, and expose a {@link TestingPinia} instance.
 *
 * These options are passed to `createPiniaPlugin()` after the Mount Pipeline
 * has resolved the plugin configuration.
 *
 * Input metadata provided through `withPluginInstance()` is processed
 * before this stage and is not part of the resolved runtime options.
 *
 * @internal
 *
 * @see {@link VueTestPiniaOptions}
 * @see `RuntimePluginOptions` from `@testforgejs/vue-test-core`.
 */
export type PiniaRuntimeOptions = RuntimePluginOptions<TestingPinia, VueTestPiniaOptions>;
