import { describe, it, expect } from "vitest";
import { assertResolvedPluginValues } from "../assertResolvedPluginValues.js";

import type { ResolvedPluginOptions } from "../../../../../types";

describe("assertResolvedPluginValues", () => {
  it("should NOT throw for valid plugin objects", () => {
    const plugins = {
      pinia: {},
      i18n: {
        locale: "en",
      },
    };

    expect(() => {
      assertResolvedPluginValues(plugins);
    }).not.toThrow();
  });

  it("should NOT throw for plugins configured as false", () => {
    const plugins = {
      pinia: false,
      router: false,
    } as const;

    expect(() => {
      assertResolvedPluginValues(plugins);
    }).not.toThrow();
  });

  const invalidValues = [null, [], true, 123, "invalid"];

  it.each(invalidValues)("should throw for invalid plugin value: %p", (value) => {
    const plugins = {
      pinia: value,
    } as ResolvedPluginOptions;

    expect(() => {
      assertResolvedPluginValues(plugins);
    }).toThrow('Invalid configuration for plugin "pinia" in plugins');
  });

  it("should include plugin name in error message", () => {
    const plugins = {
      i18n: 123,
    } as unknown as ResolvedPluginOptions;

    expect(() => {
      assertResolvedPluginValues(plugins);
    }).toThrow(/i18n/);
  });

  it("should NOT throw for empty plugin object", () => {
    const plugins = {};

    expect(() => {
      assertResolvedPluginValues(plugins);
    }).not.toThrow();
  });
});
