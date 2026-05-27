import type { VueTestPiniaOptions } from "@testforge/vue-test-plugin-pinia";

export const defaultPinia: VueTestPiniaOptions = {
  initialState: {},
  stubActions: false,
  createSpy: undefined,
};
