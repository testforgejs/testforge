import type { PluginOptionsFactory } from "@testforgejs/vue-test-core";
import type { VueTestPiniaOptions } from "@testforgejs/vue-test-plugin-pinia";

export const defaultPinia: PluginOptionsFactory<VueTestPiniaOptions> = () => ({
  initialState: {},
  stubActions: false,
});
