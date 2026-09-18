import type { PluginDefaultOptionsFactory } from "@testforgejs/vue-test-core";
import type { VueTestPiniaOptions } from "./types/types";

/**
 * Creates the default Pinia options used by TestForge.
 *
 * Provides an empty initial state and keeps actions unstubbed by default.
 * When a test runner is provided, its mock function is used as the
 * `createSpy` implementation required by Pinia testing utilities.
 *
 * @param runner Optional test runner used to provide the spy implementation.
 *
 * @returns A factory that creates the default Pinia options.
 */
export const defaultOptions: PluginDefaultOptionsFactory<VueTestPiniaOptions> = (runner) => () => ({
  initialState: {},
  stubActions: false,
  createSpy: runner?.fn,
});
