import { describe, expect, it, vi } from "vitest";

import { ERROR_PREFIX } from "../../../../src/constants/constants.js";
import { fromPluginInstance } from "../../../../src/plugins/dependencies/fromPluginInstance.js";
import { resolvePluginInstanceReferences } from "../../../../src/plugins/dependencies/resolvePluginInstanceReferences.js";

import type { PluginName } from "../../../../src/types";

import type { TestDependencyAInstance } from "./fixtures/pluginRegistry";
import "./fixtures/pluginRegistry";

function createPlugins(
  entries: readonly [PluginName, unknown][],
): ReadonlyMap<PluginName, unknown> {
  return new Map(entries);
}

describe("resolvePluginInstanceReferences", () => {
  it("should resolve a plugin instance reference", () => {
    const instance = {
      value: "resolved",
    };

    const resolver = vi.fn((pluginInstance: typeof instance) => pluginInstance.value);

    const reference = fromPluginInstance("dependencyA", resolver);

    const createdPlugins = createPlugins([["dependencyA", instance]]);

    const resolved = resolvePluginInstanceReferences(reference, createdPlugins);

    expect(resolved).toBe("resolved");
    expect(resolver).toHaveBeenCalledOnce();
    expect(resolver).toHaveBeenCalledWith(instance);
  });

  it("should resolve references in nested objects and arrays", () => {
    const createdPlugins = createPlugins([
      [
        "dependencyA",
        {
          value: "resolved",
        },
      ],
      [
        "dependencyB",
        {
          count: 42,
        },
      ],
    ]);

    const config = {
      nested: {
        value: fromPluginInstance("dependencyA", (instance) => instance.value),
      },
      items: ["unchanged", fromPluginInstance("dependencyB", (instance) => instance.count)],
    };

    const resolved = resolvePluginInstanceReferences(config, createdPlugins);

    expect(resolved).toEqual({
      nested: {
        value: "resolved",
      },
      items: ["unchanged", 42],
    });
  });

  it("should resolve multiple references to different plugin instances", () => {
    const createdPlugins = createPlugins([
      [
        "dependencyA",
        {
          value: "test",
        },
      ],
      [
        "dependencyB",
        {
          count: 10,
        },
      ],
    ]);

    const config = {
      first: fromPluginInstance("dependencyA", (instance) => instance.value),
      second: fromPluginInstance("dependencyB", (instance) => instance.count),
    };

    const resolved = resolvePluginInstanceReferences(config, createdPlugins);

    expect(resolved).toEqual({
      first: "test",
      second: 10,
    });
  });

  it("should not traverse non-plain objects", () => {
    const resolver = vi.fn((instance: TestDependencyAInstance) => instance.value);

    class CustomConfig {
      reference = fromPluginInstance("dependencyA", resolver);
    }

    const custom = new CustomConfig();

    const config = {
      custom,
    };

    const createdPlugins = createPlugins([
      [
        "dependencyA",
        {
          value: "resolved",
        },
      ],
    ]);

    const resolved = resolvePluginInstanceReferences(config, createdPlugins);

    expect(resolved.custom).toBe(custom);
    expect(resolver).not.toHaveBeenCalled();
  });

  it("should not mutate the original configuration", () => {
    const reference = fromPluginInstance("dependencyA", (instance) => instance.value);

    const config = {
      nested: {
        reference,
      },
      items: [reference],
    };

    const createdPlugins = createPlugins([
      [
        "dependencyA",
        {
          value: "resolved",
        },
      ],
    ]);

    const resolved = resolvePluginInstanceReferences(config, createdPlugins);

    expect(resolved).not.toBe(config);
    expect(resolved.nested).not.toBe(config.nested);
    expect(resolved.items).not.toBe(config.items);

    expect(config.nested.reference).toBe(reference);
    expect(config.items[0]).toBe(reference);
  });

  it("should preserve cyclic configuration structures", () => {
    const config: Record<string, unknown> = {
      reference: fromPluginInstance("dependencyA", (instance) => instance.value),
    };

    config.self = config;

    const createdPlugins = createPlugins([
      [
        "dependencyA",
        {
          value: "resolved",
        },
      ],
    ]);

    const resolved = resolvePluginInstanceReferences(config, createdPlugins);

    expect(resolved).not.toBe(config);
    expect(resolved.reference).toBe("resolved");
    expect(resolved.self).toBe(resolved);
  });

  it("should preserve shared object references", () => {
    const shared = {
      reference: fromPluginInstance("dependencyA", (instance) => instance.value),
    };

    const config = {
      first: shared,
      second: shared,
    };

    const createdPlugins = createPlugins([
      [
        "dependencyA",
        {
          value: "resolved",
        },
      ],
    ]);

    const resolved = resolvePluginInstanceReferences(config, createdPlugins);

    expect(resolved.first).not.toBe(shared);
    expect(resolved.first).toBe(resolved.second);
    expect(resolved.first).toEqual({
      reference: "resolved",
    });
  });

  it("should throw when the referenced plugin has not been created", () => {
    const reference = fromPluginInstance("dependencyA", (instance) => instance.value);

    const createdPlugins = createPlugins([]);

    expect(() => resolvePluginInstanceReferences(reference, createdPlugins)).toThrow(
      `${ERROR_PREFIX} Cannot resolve plugin instance reference "dependencyA" before the plugin has been created.`,
    );
  });
});
