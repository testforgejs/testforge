import { describe, expect, it, vi } from "vitest";

import { ERROR_PREFIX } from "../../../constants/constants.js";
import { validatePluginInstanceReferenceTargets } from "../validatePluginInstanceReferenceTargets.js";

import "./fixtures/pluginRegistry";

import type { PluginDependency } from "../types";
import type { PluginDefinition, PluginName, PluginRegistry } from "../../../types";

describe("validatePluginInstanceReferenceTargets", () => {
  const createDefinition = (supportsInstanceReferences = false): PluginDefinition => ({
    create: vi.fn(() => ({
      install: vi.fn(),
    })),
    ...(supportsInstanceReferences ? { supportsInstanceReferences: true as const } : {}),
  });

  const createRegistry = (
    definitions: Partial<Record<PluginName, PluginDefinition>> = {},
  ): Pick<PluginRegistry, "get"> => ({
    get: vi.fn((name: PluginName) => definitions[name]),
  });

  it("should accept an empty dependency list", () => {
    const registry = createRegistry();

    expect(() => validatePluginInstanceReferenceTargets([], registry)).not.toThrow();
  });

  it("should accept dependencies whose targets support instance references", () => {
    const dependencies: PluginDependency[] = [
      {
        pluginName: "sourceA",
        dependsOn: "dependencyA",
      },
      {
        pluginName: "sourceB",
        dependsOn: "dependencyB",
      },
    ];

    const registry = createRegistry({
      dependencyA: createDefinition(true),
      dependencyB: createDefinition(true),
    });

    expect(() => validatePluginInstanceReferenceTargets(dependencies, registry)).not.toThrow();
  });

  it("should accept multiple dependencies targeting the same supported plugin", () => {
    const dependencies: PluginDependency[] = [
      {
        pluginName: "sourceA",
        dependsOn: "dependencyA",
      },
      {
        pluginName: "sourceB",
        dependsOn: "dependencyA",
      },
    ];

    const registry = createRegistry({
      dependencyA: createDefinition(true),
    });

    expect(() => validatePluginInstanceReferenceTargets(dependencies, registry)).not.toThrow();
  });

  it("should throw when a dependency target is missing from the registry", () => {
    const dependencies: PluginDependency[] = [
      {
        pluginName: "sourcePlugin",
        dependsOn: "inactiveDependency",
      },
    ];

    const registry = createRegistry();

    expect(() => validatePluginInstanceReferenceTargets(dependencies, registry)).toThrow(
      `${ERROR_PREFIX} Plugin "inactiveDependency" is missing from the plugin registry while validating instance references.`,
    );
  });

  it("should throw when a dependency target does not support instance references", () => {
    const dependencies: PluginDependency[] = [
      {
        pluginName: "sourcePlugin",
        dependsOn: "dependencyA",
      },
    ];

    const registry = createRegistry({
      dependencyA: createDefinition(),
    });

    expect(() => validatePluginInstanceReferenceTargets(dependencies, registry)).toThrow(
      `${ERROR_PREFIX} Plugin "sourcePlugin" depends on plugin "dependencyA", which does not support instance references.`,
    );
  });
});
