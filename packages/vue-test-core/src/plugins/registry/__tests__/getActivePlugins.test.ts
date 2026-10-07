import { describe, expect, it } from "vitest";

import { getActivePlugins } from "../getActivePlugins.js";

import type { ResolvedPluginOptions } from "../../../types";

describe("getActivePlugins", () => {
  it("should return active plugins with their options", () => {
    const dependencyAOptions = {
      enabled: true,
    };

    const sourcePluginOptions = {
      value: "test",
    };

    const pluginNames = ["dependencyA", "sourcePlugin"];

    const options: ResolvedPluginOptions = {
      dependencyA: dependencyAOptions,
      sourcePlugin: sourcePluginOptions,
    };

    expect(getActivePlugins(pluginNames, options)).toEqual([
      {
        name: "dependencyA",
        options: dependencyAOptions,
      },
      {
        name: "sourcePlugin",
        options: sourcePluginOptions,
      },
    ]);
  });

  it("should exclude disabled plugins", () => {
    const dependencyAOptions = {};

    const pluginNames = ["dependencyA", "dependencyB", "sourcePlugin"];

    const options: ResolvedPluginOptions = {
      dependencyA: dependencyAOptions,
      dependencyB: false,
      sourcePlugin: {},
    };

    expect(getActivePlugins(pluginNames, options)).toEqual([
      {
        name: "dependencyA",
        options: dependencyAOptions,
      },
      {
        name: "sourcePlugin",
        options: {},
      },
    ]);
  });

  it("should preserve plugin name iteration order", () => {
    const pluginNames = ["sourcePlugin", "dependencyB", "dependencyA"];

    const options: ResolvedPluginOptions = {
      dependencyA: {},
      dependencyB: {},
      sourcePlugin: {},
    };

    expect(getActivePlugins(pluginNames, options).map(({ name }) => name)).toEqual([
      "sourcePlugin",
      "dependencyB",
      "dependencyA",
    ]);
  });

  it("should only include plugins from the provided iterable", () => {
    const pluginNames = ["dependencyA", "sourcePlugin"];

    const options: ResolvedPluginOptions = {
      dependencyA: {},
      dependencyB: {},
      sourcePlugin: {},
    };

    expect(getActivePlugins(pluginNames, options).map(({ name }) => name)).toEqual([
      "dependencyA",
      "sourcePlugin",
    ]);
  });

  it("should preserve the original plugin options references", () => {
    const dependencyAOptions = {
      value: "test",
    };

    const sourcePluginOptions = {
      enabled: true,
    };

    const options: ResolvedPluginOptions = {
      dependencyA: dependencyAOptions,
      sourcePlugin: sourcePluginOptions,
    };

    const activePlugins = getActivePlugins(["dependencyA", "sourcePlugin"], options);

    expect(activePlugins[0].options).toBe(dependencyAOptions);
    expect(activePlugins[1].options).toBe(sourcePluginOptions);
  });

  it("should support any iterable of plugin names", () => {
    const pluginNames = new Set(["dependencyA", "dependencyB", "sourcePlugin"]);

    const options: ResolvedPluginOptions = {
      dependencyA: {},
      dependencyB: false,
      sourcePlugin: {},
    };

    expect(getActivePlugins(pluginNames, options).map(({ name }) => name)).toEqual([
      "dependencyA",
      "sourcePlugin",
    ]);
  });

  it("should return an empty array when no plugin names are provided", () => {
    const options: ResolvedPluginOptions = {
      dependencyA: {},
    };

    expect(getActivePlugins([], options)).toEqual([]);
  });

  it("should return an empty array when all plugins are disabled", () => {
    const pluginNames = ["dependencyA", "dependencyB"];

    const options: ResolvedPluginOptions = {
      dependencyA: false,
      dependencyB: false,
    };

    expect(getActivePlugins(pluginNames, options)).toEqual([]);
  });
});
