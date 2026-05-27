import type { Pinia } from "pinia";
import type { TestingOptions } from "@pinia/testing";
import type { PluginControlOptions } from "@testforge/vue-test-core";

export type MockStoresFn = (pinia: Pinia) => void;

export interface VueTestPiniaOptions extends TestingOptions, PluginControlOptions<Pinia> {
  /** Callback to mutate stores after creation. */
  mockStores?: MockStoresFn;
}
