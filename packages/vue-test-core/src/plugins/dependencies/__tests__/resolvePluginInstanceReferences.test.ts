import { describe, expect, it, vi } from "vitest";

import { ERROR_PREFIX } from "../../../constants/constants.js";
import { fromPluginInstance } from "../../../plugins/dependencies/fromPluginInstance.js";
import { resolvePluginInstanceReferences } from "../../../plugins/dependencies/resolvePluginInstanceReferences.js";

import type { PluginInstanceName } from "../../../types";

import type { TestDependencyAInstance } from "./fixtures/pluginRegistry";
import "./fixtures/pluginRegistry";

function createPlugins(
  entries: readonly (readonly [PluginInstanceName, unknown])[],
): ReadonlyMap<PluginInstanceName, unknown> {
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

    it("should resolve a root reference to the plugin instance itself", () => {
      const instance = {
        value: "resolved",
      };

      const reference = fromPluginInstance("dependencyA", (pluginInstance) => pluginInstance);

      const createdPlugins = createPlugins([["dependencyA", instance]]);

      const resolved = resolvePluginInstanceReferences(reference, createdPlugins);

      expect(resolved).toBe(instance);
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

    it("should allow cyclic references inside non-plain objects", () => {
      class RuntimeInstance {
        self = this;
      }

      const instance = new RuntimeInstance();

      const config = {
        instance,
      };

      const resolved = resolvePluginInstanceReferences(config, createPlugins([]));

      expect(resolved).toBe(config);
      expect(resolved.instance).toBe(instance);
      expect(resolved.instance.self).toBe(instance);
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

  describe("cyclic configurations", () => {
    const CIRCULAR_REFERENCE_ERROR = `${ERROR_PREFIX} Circular plugin configuration reference detected.`;

    it("should reject a self-referencing plain object", () => {
      interface CyclicConfig {
        value: string;
        self?: CyclicConfig;
      }

      const config: CyclicConfig = {
        value: "original",
      };

      config.self = config;

      expect(() => resolvePluginInstanceReferences(config, createPlugins([]))).toThrow(
        CIRCULAR_REFERENCE_ERROR,
      );

      // The source must remain unchanged.
      expect(config.self).toBe(config);
      expect(config.value).toBe("original");
    });

    it("should reject mutually referencing plain objects", () => {
      interface ConfigNode {
        value: string;
        next?: ConfigNode;
      }

      const first: ConfigNode = {
        value: "first",
      };

      const second: ConfigNode = {
        value: "second",
      };

      first.next = second;
      second.next = first;

      const config = {
        first,
        second,
      };

      expect(() => resolvePluginInstanceReferences(config, createPlugins([]))).toThrow(
        CIRCULAR_REFERENCE_ERROR,
      );

      expect(first.next).toBe(second);
      expect(second.next).toBe(first);
    });

    it("should reject a self-referencing array", () => {
      const config: unknown[] = [];

      config.push(config);

      expect(() => resolvePluginInstanceReferences(config, createPlugins([]))).toThrow(
        CIRCULAR_REFERENCE_ERROR,
      );

      expect(config[0]).toBe(config);
    });

    it("should reject cyclic configurations containing plugin instance references", () => {
      const reference = fromPluginInstance("dependencyA", (instance) => instance.value);

      interface CyclicConfig {
        dependency: typeof reference;
        self?: CyclicConfig;
      }

      const config: CyclicConfig = {
        dependency: reference,
      };

      config.self = config;

      const createdPlugins = createPlugins([["dependencyA", { value: "resolved" }]]);

      expect(() => resolvePluginInstanceReferences(config, createdPlugins)).toThrow(
        CIRCULAR_REFERENCE_ERROR,
      );

      // Even when a reference was encountered, the source is not mutated.
      expect(config.dependency).toBe(reference);
      expect(config.self).toBe(config);
    });

    it("should allow shared references without cycles", () => {
      const shared = {
        value: "shared",
      };

      const config = {
        first: shared,
        second: shared,
      };

      const resolved = resolvePluginInstanceReferences(config, createPlugins([]));

      expect(resolved).toBe(config);
      expect(resolved.first).toBe(shared);
      expect(resolved.second).toBe(shared);
    });

    it("should allow cyclic references inside opaque runtime values", () => {
      interface SharedInstance {
        self?: SharedInstance;
      }

      const sharedInstance: SharedInstance = {};

      sharedInstance.self = sharedInstance;

      const reference = fromPluginInstance("dependencyA", (instance) => instance.value);

      const config = {
        __sharedInstance: sharedInstance,
        dependency: reference,
      };

      const createdPlugins = createPlugins([["dependencyA", { value: "resolved" }]]);

      const resolved = resolvePluginInstanceReferences(config, createdPlugins);

      expect(resolved).not.toBe(config);
      expect(resolved.dependency).toBe("resolved");

      // The cyclic runtime instance is opaque and preserves its identity.
      expect(resolved.__sharedInstance).toBe(sharedInstance);
      expect(resolved.__sharedInstance.self).toBe(sharedInstance);

      // The original configuration remains unchanged.
      expect(config.dependency).toBe(reference);
      expect(config.__sharedInstance).toBe(sharedInstance);
    });

    it("should reject cycles spanning plain objects and arrays", () => {
      interface CyclicConfig {
        items: unknown[];
      }

      const config: CyclicConfig = {
        items: [],
      };

      config.items.push(config);

      expect(() => resolvePluginInstanceReferences(config, createPlugins([]))).toThrow(
        CIRCULAR_REFERENCE_ERROR,
      );

      expect(config.items[0]).toBe(config);
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

    it("should preserve symbol-keyed properties when resolving instance references", () => {
      const symbol = Symbol("plugin-expose");
      const expose = vi.fn();

      const reference = fromPluginInstance("dependencyA", (instance) => instance.value);

      const config = {
        dependency: reference,
        [symbol]: expose,
      };

      const createdPlugins = createPlugins([["dependencyA", { value: "resolved" }]]);

      const resolved = resolvePluginInstanceReferences(config, createdPlugins);

      // Resolving the reference creates a new configuration object.
      expect(resolved).not.toBe(config);
      expect(resolved.dependency).toBe("resolved");

      // Symbol-keyed properties must survive the copy.
      expect(resolved[symbol]).toBe(expose);

      // The original configuration must remain unchanged.
      expect(config.dependency).toBe(reference);
      expect(config[symbol]).toBe(expose);
    });

    it("should preserve the original array when no references are resolved", () => {
      const nested = {
        value: "nested",
      };

      const config = [1, 2, nested];

      const resolved = resolvePluginInstanceReferences(config, createPlugins([]));

      expect(resolved).toBe(config);
      expect(resolved[2]).toBe(nested);
    });

    it("should preserve a non-plain root object without traversing it", () => {
      class CustomConfig {
        value = "original";

        getValue() {
          return this.value;
        }
      }

      const config = new CustomConfig();

      const resolved = resolvePluginInstanceReferences(config, createPlugins([]));

      expect(resolved).toBe(config);
      expect(resolved.value).toBe("original");
      expect(resolved.getValue()).toBe("original");
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

      const createdPlugins = createPlugins([
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

    it("should resolve references in a root array without mutating the source", () => {
      const reference = fromPluginInstance("dependencyA", (instance) => instance.value);

      const unchanged = {
        value: "unchanged",
      };

      const config = [reference, unchanged];

      const createdPlugins = createPlugins([["dependencyA", { value: "resolved" }]]);

      const resolved = resolvePluginInstanceReferences(config, createdPlugins);

      expect(resolved).not.toBe(config);

      expect(resolved[0]).toBe("resolved");
      expect(resolved[1]).toBe(unchanged);

      expect(config[0]).toBe(reference);
      expect(config[1]).toBe(unchanged);
    });
  });

  describe("resolution isolation", () => {
    it("should resolve the same configuration independently across calls", () => {
      const reference = fromPluginInstance("dependencyA", (instance) => instance.value);

      const unchanged = {
        value: "shared",
      };

      const config = {
        nested: {
          dependency: reference,
        },
        unchanged,
      };

      const firstInstance = {
        value: "first-instance",
      };

      const secondInstance = {
        value: "second-instance",
      };

      const firstPlugins = createPlugins([["dependencyA", firstInstance]]);

      const secondPlugins = createPlugins([["dependencyA", secondInstance]]);

      const firstResolved = resolvePluginInstanceReferences(config, firstPlugins);

      const secondResolved = resolvePluginInstanceReferences(config, secondPlugins);

      // Resolve references independently for each call.
      expect(firstResolved.nested.dependency).toBe("first-instance");
      expect(secondResolved.nested.dependency).toBe("second-instance");

      // Create independent copies of affected branches.
      expect(firstResolved).not.toBe(secondResolved);
      expect(firstResolved.nested).not.toBe(secondResolved.nested);

      expect(firstResolved.nested).not.toBe(config.nested);
      expect(secondResolved.nested).not.toBe(config.nested);

      // Preserve unchanged branches through structural sharing.
      expect(firstResolved.unchanged).toBe(unchanged);
      expect(secondResolved.unchanged).toBe(unchanged);

      // The second resolution must not affect the first result.
      expect(firstResolved.nested.dependency).toBe("first-instance");

      // Never mutate the original configuration.
      expect(config.nested.dependency).toBe(reference);
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

    it("should preserve the source configuration when resolution fails", () => {
      const validReference = fromPluginInstance("dependencyA", (instance) => instance.value);

      const missingReference = fromPluginInstance("dependencyB", (instance) => instance.count);

      const config = {
        first: {
          dependency: validReference,
        },
        second: {
          dependency: missingReference,
        },
      };

      const createdPlugins = createPlugins([["dependencyA", { value: "resolved" }]]);

      expect(() => resolvePluginInstanceReferences(config, createdPlugins)).toThrow(
        `${ERROR_PREFIX} Cannot resolve plugin instance reference "dependencyB" before the plugin has been created.`,
      );

      expect(config.first.dependency).toBe(validReference);
      expect(config.second.dependency).toBe(missingReference);
    });
  });
});
