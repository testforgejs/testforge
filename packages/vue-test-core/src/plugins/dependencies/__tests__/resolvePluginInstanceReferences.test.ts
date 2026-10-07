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
  describe("reference resolution", () => {
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
  });

  describe("configuration traversal", () => {
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

    it("should treat pre-created plugin instances as opaque", () => {
      const reference = fromPluginInstance("dependencyA", (instance) => instance.value);

      const sharedInstance = {
        nested: reference,
      };

      const config = {
        __sharedInstance: sharedInstance,
      };

      const resolved = resolvePluginInstanceReferences(
        config,
        createPlugins([
          [
            "dependencyA",
            {
              value: "resolved",
            },
          ],
        ]),
      );

      expect(resolved).toBe(config);
      expect(resolved.__sharedInstance).toBe(sharedInstance);
      expect(resolved.__sharedInstance.nested).toBe(reference);
    });

    it("should resolve references outside opaque plugin configuration values", () => {
      const opaqueReference = fromPluginInstance("dependencyA", (instance) => instance.value);

      const regularReference = fromPluginInstance("dependencyA", (instance) => instance.value);

      const sharedInstance = {
        nested: opaqueReference,
      };

      const config = {
        __sharedInstance: sharedInstance,
        dependency: regularReference,
      };

      const resolved = resolvePluginInstanceReferences(
        config,
        createPlugins([
          [
            "dependencyA",
            {
              value: "resolved",
            },
          ],
        ]),
      );

      expect(resolved).not.toBe(config);

      expect(resolved.dependency).toBe("resolved");

      expect(resolved.__sharedInstance).toBe(sharedInstance);
      expect(resolved.__sharedInstance.nested).toBe(opaqueReference);

      expect(config.dependency).toBe(regularReference);
    });
  });

  describe("copy-on-write semantics", () => {
    it("should copy only branches containing resolved references without mutating the source", () => {
      const reference = fromPluginInstance("dependencyA", (instance) => instance.value);

      const unchanged = {
        value: "unchanged",
      };

      const config = {
        nested: {
          reference,
          unchanged,
        },
        items: [reference, unchanged],
        untouched: {
          value: "untouched",
        },
      };

      const originalNested = config.nested;
      const originalItems = config.items;
      const originalUntouched = config.untouched;

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

      expect(resolved.nested).not.toBe(originalNested);
      expect(resolved.items).not.toBe(originalItems);

      expect(resolved.untouched).toBe(originalUntouched);
      expect(resolved.nested.unchanged).toBe(unchanged);
      expect(resolved.items[1]).toBe(unchanged);

      expect(resolved.nested.reference).toBe("resolved");
      expect(resolved.items[0]).toBe("resolved");

      expect(config.nested.reference).toBe(reference);
      expect(config.items[0]).toBe(reference);
    });

    it("should preserve the original configuration when no references are resolved", () => {
      const nested = {
        value: "nested",
      };

      const items = ["first", "second"];

      const config = {
        nested,
        items,
      };

      const resolved = resolvePluginInstanceReferences(config, createPlugins([]));

      expect(resolved).toBe(config);
      expect(resolved.nested).toBe(nested);
      expect(resolved.items).toBe(items);
    });

    it("should preserve shared object references when a shared branch is copied", () => {
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

      expect(resolved).not.toBe(config);

      expect(resolved.first).not.toBe(shared);
      expect(resolved.first).toBe(resolved.second);

      expect(resolved.first).toEqual({
        reference: "resolved",
      });

      expect(config.first).toBe(shared);
      expect(config.second).toBe(shared);
      expect(config.first.reference).toBe(shared.reference);
    });

    it("should preserve opaque runtime value identity while resolving sibling references", () => {
      const sharedInstance = {
        id: "shared",
        install: () => {},
      };

      const config = {
        __sharedInstance: sharedInstance,
        dependency: fromPluginInstance("dependencyA", (instance) => instance.value),
      };

      const createdPlugins = new Map([
        [
          "dependencyA",
          {
            value: "resolved",
          },
        ],
      ]);

      const resolved = resolvePluginInstanceReferences(config, createdPlugins);

      expect(resolved.__sharedInstance).toBe(sharedInstance);
      expect(resolved.dependency).toBe("resolved");
    });
  });

  describe("error handling", () => {
    it("should throw when the referenced plugin has not been created", () => {
      const reference = fromPluginInstance("dependencyA", (instance) => instance.value);

      const createdPlugins = createPlugins([]);

      expect(() => resolvePluginInstanceReferences(reference, createdPlugins)).toThrow(
        `${ERROR_PREFIX} Cannot resolve plugin instance reference "dependencyA" before the plugin has been created.`,
      );
    });
  });
});
