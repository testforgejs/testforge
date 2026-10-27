export {};

// Test plugin types

interface PiniaOptions {
  stubActions?: boolean;
  initialState?: Record<string, unknown>;
}

interface I18nOptions {
  locale?: string;
}

interface RequiredPluginOptions {
  apiKey: string;
  environment: "development" | "production";
  debug?: boolean;
}

// Module augmentation

declare module "../dist/index.js" {
  interface PluginOptionsMap {
    pinia: PiniaOptions;
    i18n: I18nOptions;
    requiredPlugin: RequiredPluginOptions;
  }
}
