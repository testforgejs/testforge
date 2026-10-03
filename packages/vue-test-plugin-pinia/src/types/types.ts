import type { TestingPinia } from "@pinia/testing";
import type { TestingOptions } from "@pinia/testing";
import type { PluginControlOptions } from "@testforgejs/vue-test-core";

/**
 * A callback function to mutate or configure Pinia stores immediately after they are created.
 * Used to set the initial state (mocking) in tests.
 *
 * @param pinia - Созданный инстанс Pinia для тестирования.
 */
export type MockStoresFn = (pinia: TestingPinia) => void;

/**
 * Configuration options for the Pinia test plugin.
 *
 * This interface integrates the standard Pinia testing initialization settings
 * (`TestingOptions` from `@pinia/testing`) with the TestForge core configuration options.
 *
 * @see {@link TestingOptions} to configure action stubs and the initial state.
 * @see {@link PluginControlOptions} to use interception methods such as `expose`.
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
