import { MOCK_STORES } from "../constants/constants.js";

import type { MockStoresFn } from "../types/types.js";

/**
 * Creates Pinia plugin options for initializing or modifying stores
 * before the component is mounted.
 *
 * The callback receives the resolved testing Pinia instance, whether
 * it was newly created or reused through `withPluginInstance()`.
 *
 * Spread the returned options into the Pinia configuration provided
 * to a TestForge component factory.
 *
 * @param mockStores - Callback invoked with the resolved testing Pinia instance.
 * @returns Plugin options containing the store initialization callback.
 *
 * @example
 * ```ts
 * import { withMockStores } from "@testforgejs/vue-test-plugin-pinia";
 *
 * factory({}, {
 *   plugins: {
 *     pinia: {
 *       ...withMockStores((pinia) => {
 *         const store = useCounterStore(pinia);
 *         store.count = 42;
 *       }),
 *     },
 *   },
 * });
 * ```
 */
export function withMockStores(mockStores: MockStoresFn) {
  return {
    [MOCK_STORES]: mockStores,
  };
}
