import { describe, expect, it } from "vitest";

import { sortPluginDependencyGraph } from "../../../plugins/dependencies/sortPluginDependencyGraph.js";

import type { PluginInstanceName, PluginName } from "../../../types.js";
import type { PluginDependencyGraph } from "../../../plugins/dependencies/types.js";

import "./fixtures/pluginRegistry";

function createGraph(
  entries: readonly [PluginName, readonly PluginInstanceName[]][],
): PluginDependencyGraph {
  return new Map(entries.map(([pluginName, dependencies]) => [pluginName, new Set(dependencies)]));
}

describe("sortPluginDependencyGraph", () => {
  it("should return an empty array for an empty graph", () => {
    const graph = createGraph([]);

    expect(sortPluginDependencyGraph(graph)).toEqual([]);
  });

  it("should preserve the order of plugins without dependencies", () => {
    const graph = createGraph([
      ["dependencyA", []],
      ["sourcePlugin", []],
      ["dependencyB", []],
    ]);

    expect(sortPluginDependencyGraph(graph)).toEqual([
      "dependencyA",
      "sourcePlugin",
      "dependencyB",
    ]);
  });

  it("should place a dependency before the plugin that depends on it", () => {
    const graph = createGraph([
      ["sourcePlugin", ["dependencyA"]],
      ["dependencyA", []],
    ]);

    expect(sortPluginDependencyGraph(graph)).toEqual(["dependencyA", "sourcePlugin"]);
  });

  it("should sort transitive dependencies before dependent plugins", () => {
    const graph = createGraph([
      ["sourcePlugin", ["dependencyB"]],
      ["dependencyB", ["dependencyA"]],
      ["dependencyA", []],
    ]);

    expect(sortPluginDependencyGraph(graph)).toEqual([
      "dependencyA",
      "dependencyB",
      "sourcePlugin",
    ]);
  });

  it("should place multiple dependencies before the dependent plugin", () => {
    const graph = createGraph([
      ["sourcePlugin", ["dependencyA", "dependencyB"]],
      ["dependencyA", []],
      ["dependencyB", []],
    ]);

    expect(sortPluginDependencyGraph(graph)).toEqual([
      "dependencyA",
      "dependencyB",
      "sourcePlugin",
    ]);
  });

  it("should include a shared dependency only once", () => {
    const graph = createGraph([
      ["sourcePlugin", ["dependencyA", "dependencyB"]],
      ["dependencyA", ["dependencyC"]],
      ["dependencyB", ["dependencyC"]],
      ["dependencyC", []],
    ]);

    expect(sortPluginDependencyGraph(graph)).toEqual([
      "dependencyC",
      "dependencyA",
      "dependencyB",
      "sourcePlugin",
    ]);
  });

  it("should preserve traversal order for independent branches", () => {
    const graph = createGraph([
      ["sourcePlugin", ["dependencyA"]],
      ["dependencyB", []],
      ["dependencyA", []],
    ]);

    expect(sortPluginDependencyGraph(graph)).toEqual([
      "dependencyA",
      "sourcePlugin",
      "dependencyB",
    ]);
  });

  it("should return an immutable plugin order", () => {
    const graph = createGraph([
      ["dependencyA", []],
      ["sourcePlugin", ["dependencyA"]],
    ]);

    const sorted = sortPluginDependencyGraph(graph);

    expect(Object.isFrozen(sorted)).toBe(true);
  });
});
