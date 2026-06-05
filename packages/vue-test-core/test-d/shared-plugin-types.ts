export {};

// Test plugin types

interface PiniaOptions {
  stubActions?: boolean;
  initialState?: Record<string, unknown>;
}

interface I18nOptions {
  locale?: string;
}

// Module augmentation

declare module "../dist/index" {
  interface PluginOptionsMap {
    pinia: PiniaOptions;
    i18n: I18nOptions;
  }
}
