import type { TestingPinia, TestingOptions } from "@pinia/testing";
import type { PluginControlOptions } from "@testforgejs/vue-test-core";

/**
 * A callback for configuring stores on a resolved testing Pinia instance
 * before the component is mounted.
 *
 * The instance may be newly created or reused through `__meta.instance`.
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
 * Instance capturing is handled internally by TestForge using
 * `captureInstance<TestingPinia>()`.
 *
 * @see `TestingOptions` from `@pinia/testing` for native Pinia testing configuration.
 * @see `PluginControlOptions` from `@testforgejs/vue-test-core` for type-safe instance capturing.
 */
export type VueTestPiniaOptions = TestingOptions &
  PluginControlOptions<TestingPinia> & {
    /**
     * A callback for initializing or modifying Pinia stores before the
     * component is mounted.
     *
     * The callback runs after the Pinia instance has been resolved,
     * regardless of whether it was newly created or provided through
     * `__meta.instance`.
     *
     * When an existing Pinia instance is reused, the callback operates
     * on that same instance and may modify its existing stores.
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
  };
