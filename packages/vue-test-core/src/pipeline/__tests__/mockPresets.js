const createMockPlugin = (name) => ({
  getName: () => name,
  getDefinition: () => ({
    create: () => ({
      install() {},
    }),
  }),
  getDefaultOptions: () => () => ({}),
});

const mockPiniaPlugin = createMockPlugin("pinia");
const mockI18nPlugin = createMockPlugin("i18n");
const mockRouterPlugin = createMockPlugin("router");

/** @type TestFrameworkPresets */
export const presets = {
  default: {
    manifest: [
      { module: mockPiniaPlugin, enabled: true },
      { module: mockI18nPlugin, enabled: true },
      { module: mockRouterPlugin, enabled: false },
    ],
    defaults: {
      i18n: () => ({
        legacy: false,
        locale: "en",
        fallbackLocale: "en",
        messages: {},
        fallbackWarn: false,
        missingWarn: false,
      }),
      pinia: () => ({
        initialState: {
          counter: { n: 20 },
          user: { name: "Alice" },
        },
        stubActions: false,
        mocks: {},
        mockStores: null,
        createSpy: undefined,
      }),
      router: () => ({
        history: {},
        routes: [{ path: "/", component: { render: () => null } }],
      }),
    },
  },
  lightweightPreset: {
    manifest: [
      { module: mockPiniaPlugin, enabled: true },
      { module: mockI18nPlugin, enabled: true },
    ],
    defaults: {
      i18n: () => ({
        locale: "en",
        messages: {},
      }),
      pinia: () => ({
        initialState: {},
        stubActions: false,
        mocks: {},
      }),
    },
  },
  i18nPreset: {
    manifest: [{ module: mockI18nPlugin, enabled: true }],
    defaults: {
      i18n: () => ({
        legacy: false,
        locale: "en",
        fallbackLocale: "en",
        messages: {},
        fallbackWarn: false,
        missingWarn: false,
      }),
    },
  },
  i18nDisabledPreset: {
    manifest: [{ module: mockI18nPlugin, enabled: false }],
    defaults: {
      i18n: () => ({
        legacy: false,
        locale: "en",
        fallbackLocale: "en",
        messages: {},
        fallbackWarn: false,
        missingWarn: false,
      }),
    },
  },
  routerPreset: {
    manifest: [{ module: mockRouterPlugin, enabled: true }],
    defaults: {
      router: () => ({
        history: {},
        routes: [{ path: "/", component: { render: () => null } }],
      }),
    },
  },
};
