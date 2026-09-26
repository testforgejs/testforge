import type { PluginDefaultOptionsFactory } from "@testforgejs/vue-test-core";
import type { VueTestPiniaOptions } from "./types/types";

/**
 * Creates the default Pinia options used by TestForge.
 *
 * When a test runner is provided, its mock function is used as the
 * `createSpy` implementation. When omitted, `createSpy` is left
 * undefined and `@pinia/testing` handles spy resolution.
 *
 * @param runner Optional test runner used to provide the spy implementation.
 *
 * @returns A factory that creates the default Pinia options.
 */
export const defaultOptions: PluginDefaultOptionsFactory<VueTestPiniaOptions> = (runner) => () => {
  if (!runner) {
    return {};
  }

  return {
    createSpy: runner.fn,
  };
};
