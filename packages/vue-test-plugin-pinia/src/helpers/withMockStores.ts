import { MOCK_STORES } from "../constants/constants.js";

import type { MockStoresFn } from "../types/types";

/*
 * Configures a callback for initializing or modifying Pinia stores
 * before the component is mounted.
 *
 * The callback runs for both newly created Pinia instances and
 * pre-created instances reused through `withPluginInstance()`.
 *
 * @example
 * ```ts
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
