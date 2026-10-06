import { describe, expect, it } from "vitest";

import { ERROR_PREFIX } from "../../../../src/constants/constants.js";
import { validatePluginDependencyGraph } from "../../../../src/plugins/dependencies/validatePluginDependencyGraph.js";

import type { PluginInstanceName, PluginName } from "../../../../src/types";
import type { PluginDependencyGraph } from "../../../../src/plugins/dependencies/types";

import "./fixtures/pluginRegistry";

function createGraph(
  entries: readonly [PluginName, readonly PluginInstanceName[]][],
): PluginDependencyGraph {
  return new Map(entries.map(([pluginName, dependencies]) => [pluginName, new Set(dependencies)]));
}

describe("validatePluginDependencyGraph", () => {
  it("should accept a valid dependency graph", () => {
    const graph = createGraph([
      ["dependencyA", []],
      ["dependencyB", ["dependencyA"]],
      ["sourcePlugin", ["dependencyA", "dependencyB"]],
    ]);

    expect(() => validatePluginDependencyGraph(graph)).not.toThrow();
  });

  it("should accept a graph without dependencies", () => {
    const graph = createGraph([
      ["dependencyA", []],
      ["dependencyB", []],
      ["sourcePlugin", []],
    ]);

    expect(() => validatePluginDependencyGraph(graph)).not.toThrow();
  });

  it("should throw when a dependency plugin is not active", () => {
    const graph = createGraph([["sourcePlugin", ["inactiveDependency"]]]);

    expect(() => validatePluginDependencyGraph(graph)).toThrow(
      `${ERROR_PREFIX} Plugin "sourcePlugin" depends on inactive plugin "inactiveDependency".`,
    );
  });

  it("should throw when a plugin depends on itself", () => {
    const graph = createGraph([["dependencyA", ["dependencyA"]]]);

    expect(() => validatePluginDependencyGraph(graph)).toThrow(
      `${ERROR_PREFIX} Plugin "dependencyA" cannot depend on itself.`,
    );
  });

  it("should throw on a direct circular dependency", () => {
    const graph = createGraph([
      ["dependencyA", ["dependencyB"]],
      ["dependencyB", ["dependencyA"]],
    ]);

    expect(() => validatePluginDependencyGraph(graph)).toThrow(
      `${ERROR_PREFIX} Circular plugin dependency detected: "dependencyA" -> "dependencyB" -> "dependencyA".`,
    );
  });

  it("should throw on an indirect circular dependency", () => {
    const graph = createGraph([
      ["dependencyA", ["dependencyB"]],
      ["dependencyB", ["dependencyC"]],
      ["dependencyC", ["dependencyA"]],
    ]);

    expect(() => validatePluginDependencyGraph(graph)).toThrow(
      `${ERROR_PREFIX} Circular plugin dependency detected: "dependencyA" -> "dependencyB" -> "dependencyC" -> "dependencyA".`,
    );
  });

  it("should detect a cycle in a disconnected part of the graph", () => {
    const graph = createGraph([
      ["sourcePlugin", ["dependencyA"]],
      ["dependencyA", []],
      ["dependencyB", ["dependencyC"]],
      ["dependencyC", ["dependencyB"]],
    ]);

    expect(() => validatePluginDependencyGraph(graph)).toThrow(
      `${ERROR_PREFIX} Circular plugin dependency detected: "dependencyB" -> "dependencyC" -> "dependencyB".`,
    );
  });
});
