import { describe, expect, it } from "vitest";

import { ERROR_PREFIX } from "../../../constants/constants.js";
import { buildPluginDependencyGraph } from "../../../plugins/dependencies/buildPluginDependencyGraph.js";

import type { PluginDependency } from "../../../plugins/dependencies/types";

import "./fixtures/pluginRegistry";

describe("buildPluginDependencyGraph", () => {
  it("should include active plugins without dependencies", () => {
    const graph = buildPluginDependencyGraph(["dependencyA", "dependencyB"], []);

    expect(graph).toEqual(
      new Map([
        ["dependencyA", new Set()],
        ["dependencyB", new Set()],
      ]),
    );
  });

  it("should build dependencies for active plugins", () => {
    const dependencies: PluginDependency[] = [
      {
        pluginName: "sourcePlugin",
        dependsOn: "dependencyA",
      },
      {
        pluginName: "sourcePlugin",
        dependsOn: "dependencyB",
      },
    ];

    const graph = buildPluginDependencyGraph(
      ["dependencyA", "dependencyB", "sourcePlugin"],
      dependencies,
    );

    expect(graph).toEqual(
      new Map([
        ["dependencyA", new Set()],
        ["dependencyB", new Set()],
        ["sourcePlugin", new Set(["dependencyA", "dependencyB"])],
      ]),
    );
  });

  it("should deduplicate repeated dependencies", () => {
    const dependencies: PluginDependency[] = [
      {
        pluginName: "sourcePlugin",
        dependsOn: "dependencyA",
      },
      {
        pluginName: "sourcePlugin",
        dependsOn: "dependencyA",
      },
    ];

    const graph = buildPluginDependencyGraph(["dependencyA", "sourcePlugin"], dependencies);

    expect(graph.get("sourcePlugin")).toEqual(new Set(["dependencyA"]));
  });

  it("should preserve dependencies on plugins that are not active", () => {
    const dependencies: PluginDependency[] = [
      {
        pluginName: "sourcePlugin",
        dependsOn: "dependencyA",
      },
    ];

    const graph = buildPluginDependencyGraph(["sourcePlugin"], dependencies);

    expect(graph.get("sourcePlugin")).toEqual(new Set(["dependencyA"]));

    expect(graph.has("dependencyA")).toBe(false);
  });

  it("should preserve self-dependencies for later validation", () => {
    const dependencies: PluginDependency[] = [
      {
        pluginName: "dependencyA",
        dependsOn: "dependencyA",
      },
    ];

    const graph = buildPluginDependencyGraph(["dependencyA"], dependencies);

    expect(graph.get("dependencyA")).toEqual(new Set(["dependencyA"]));
  });

  it("should throw when dependencies are provided for an unknown source plugin", () => {
    const dependencies: PluginDependency[] = [
      {
        pluginName: "sourcePlugin",
        dependsOn: "dependencyA",
      },
    ];

    expect(() => buildPluginDependencyGraph(["dependencyA"], dependencies)).toThrow(
      `${ERROR_PREFIX} Cannot register dependencies for unknown plugin "sourcePlugin".`,
    );
  });
});
