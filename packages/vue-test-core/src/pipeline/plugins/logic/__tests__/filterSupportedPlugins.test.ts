import { describe, it, expect } from "vitest";

import { filterSupportedPlugins } from "../filterSupportedPlugins";

describe("filterSupportedPlugins", () => {
  it("should keep only plugins supported by the active preset", () => {
    const plugins = {
      pinia: {},
      i18n: {},
      router: {},
    };

    const supported = {
      pinia: true,
      i18n: true,
    };

    const result = filterSupportedPlugins(plugins, supported);

    expect(result).toEqual({
      pinia: {},
      i18n: {},
    });
  });

  it("should preserve disabled plugins if they are supported", () => {
    const plugins = {
      pinia: false,
      i18n: {},
    } as const;

    const supported = {
      pinia: true,
      i18n: true,
    };

    const result = filterSupportedPlugins(plugins, supported);

    expect(result).toEqual({
      pinia: false,
      i18n: {},
    });
  });

  it("should remove unsupported plugins even if they contain configuration", () => {
    const plugins = {
      pinia: { store: true },
      router: { history: true },
    };

    const supported = {
      pinia: true,
    };

    const result = filterSupportedPlugins(plugins, supported);

    expect(result).toEqual({
      pinia: { store: true },
    });
  });

  it("should return empty object when no plugins are supported", () => {
    const plugins = {
      pinia: {},
      i18n: {},
    };

    const supported = {};

    const result = filterSupportedPlugins(plugins, supported);

    expect(result).toEqual({});
  });

  it("should return empty object when plugins are undefined", () => {
    const supported = {
      pinia: true,
    };

    const result = filterSupportedPlugins(undefined, supported);

    expect(result).toEqual({});
  });

  it("should not mutate original plugins object", () => {
    const plugins = {
      pinia: {},
      router: {},
    };

    const snapshot = { ...plugins };

    filterSupportedPlugins(plugins, {
      pinia: true,
    });

    expect(plugins).toEqual(snapshot);
  });
});
