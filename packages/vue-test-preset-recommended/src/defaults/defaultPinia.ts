import type { VueTestPiniaOptions } from "@testforgejs/vue-test-plugin-pinia";

export const defaultPinia: VueTestPiniaOptions = {
  initialState: {},
  stubActions: false,
  createSpy: undefined,
};
