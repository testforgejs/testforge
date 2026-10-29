import { describe, expect, it } from "vitest";

import { ERROR_PREFIX } from "../../../constants/constants.js";
import { fromPluginInstance } from "../fromPluginInstance.js";
import { resolvePluginCreationOrder } from "../resolvePluginCreationOrder.js";
import { createPluginRegistry } from "../../registry/createPluginRegistry.js";
import { getActivePlugins } from "../../registry/getActivePlugins.js";

import type { PluginName, ResolvedPluginOptions } from "../../../types.js";

import "./fixtures/pluginRegistry";

interface TestPlugin {
  name: PluginName;
  supportsInstanceReferences?: true;
}

function createRegistry(plugins: readonly TestPlugin[]) {
  return createPluginRegistry(
    plugins.map(({ name, supportsInstanceReferences }) => ({
      module: {
        getName: () => name,
        getDefinition: () => ({
          create: () => ({
            install: () => {},
          }),
          ...(supportsInstanceReferences ? { supportsInstanceReferences } : {}),
        }),
      },
      enabled: true,
    })),
  );
}

type TestRegistry = ReturnType<typeof createRegistry>;

function resolveOrder(
  registry: TestRegistry,
  options: ResolvedPluginOptions,
): readonly PluginName[] {
  const activePlugins = getActivePlugins(registry.getNames(), options);

  return resolvePluginCreationOrder(activePlugins, registry);
}

describe("resolvePluginCreationOrder", () => {
  describe("creation order", () => {
    it("should preserve active plugin order when there are no dependencies", () => {
      const registry = createRegistry([
        { name: "source" },
        { name: "dependencyA" },
        { name: "dependencyB" },
      ]);

      const order = resolveOrder(registry, {
        source: {},
        dependencyA: {},
        dependencyB: {},
      });

      expect(order).toEqual(["source", "dependencyA", "dependencyB"]);
    });

    it("should return an empty order when no plugins are active", () => {
      const registry = createRegistry([{ name: "source" }, { name: "dependencyA" }]);

      const order = resolveOrder(registry, {});

      expect(order).toEqual([]);
    });

    it("should place a dependency before its dependent plugin", () => {
      const registry = createRegistry([
        { name: "source" },
        {
          name: "dependencyA",
          supportsInstanceReferences: true,
        },
      ]);

      const order = resolveOrder(registry, {
        source: {
          dependency: fromPluginInstance("dependencyA", (instance) => instance.value),
        },
        dependencyA: {},
      });

      expect(order).toEqual(["dependencyA", "source"]);
    });

    it("should resolve transitive plugin dependencies", () => {
      const registry = createRegistry([
        { name: "source" },
        {
          name: "dependencyB",
          supportsInstanceReferences: true,
        },
        {
          name: "dependencyA",
          supportsInstanceReferences: true,
        },
      ]);

      const order = resolveOrder(registry, {
        source: {
          dependency: fromPluginInstance("dependencyB", (instance) => instance.count),
        },
        dependencyB: {
          dependency: fromPluginInstance("dependencyA", (instance) => instance.value),
        },
        dependencyA: {},
      });

      expect(order).toEqual(["dependencyA", "dependencyB", "source"]);
    });

    it("should include shared dependencies only once", () => {
      const registry = createRegistry([
        { name: "source" },
        {
          name: "dependencyA",
          supportsInstanceReferences: true,
        },
        {
          name: "dependencyB",
          supportsInstanceReferences: true,
        },
      ]);

      const order = resolveOrder(registry, {
        source: {
          first: fromPluginInstance("dependencyA", (instance) => instance.value),
          second: fromPluginInstance("dependencyB", (instance) => instance.count),
        },
        dependencyA: {},
        dependencyB: {
          dependency: fromPluginInstance("dependencyA", (instance) => instance.value),
        },
      });

      expect(order).toEqual(["dependencyA", "dependencyB", "source"]);

      expect(order.filter((name) => name === "dependencyA")).toHaveLength(1);
    });
  });

  describe("dependency validation", () => {
    it("should reject dependencies on inactive plugins", () => {
      const registry = createRegistry([
        { name: "source" },
        {
          name: "dependencyA",
          supportsInstanceReferences: true,
        },
      ]);

      expect(() =>
        resolveOrder(registry, {
          source: {
            dependency: fromPluginInstance("dependencyA", (instance) => instance.value),
          },
          dependencyA: false,
        }),
      ).toThrow(`${ERROR_PREFIX} Plugin "source" depends on inactive plugin "dependencyA".`);
    });

    it("should reject circular plugin dependencies", () => {
      const registry = createRegistry([
        {
          name: "dependencyA",
          supportsInstanceReferences: true,
        },
        {
          name: "dependencyB",
          supportsInstanceReferences: true,
        },
      ]);

      expect(() =>
        resolveOrder(registry, {
          dependencyA: {
            dependency: fromPluginInstance("dependencyB", (instance) => instance.count),
          },
          dependencyB: {
            dependency: fromPluginInstance("dependencyA", (instance) => instance.value),
          },
        }),
      ).toThrow(/Circular plugin dependency detected/);
    });

    it("should reject references to plugins without instance reference support", () => {
      const registry = createRegistry([{ name: "source" }, { name: "dependencyA" }]);

      expect(() =>
        resolveOrder(registry, {
          source: {
            dependency: fromPluginInstance("dependencyA", (instance) => instance.value),
          },
          dependencyA: {},
        }),
      ).toThrow(
        `${ERROR_PREFIX} Plugin "source" depends on plugin "dependencyA", which does not support instance references.`,
      );
    });
  });
});
