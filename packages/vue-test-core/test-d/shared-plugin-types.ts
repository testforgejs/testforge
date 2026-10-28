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

    unknownInstancePluginTypeSpec: {
      apiKey: string;
    };
  }

  interface PluginInstanceMap {
    pinia: {
      install(): void;
    };

    i18n: {
      install(): void;
    };

    requiredPlugin: {
      install(): void;
    };

    unknownInstancePluginTypeSpec: unknown;
  }
}
