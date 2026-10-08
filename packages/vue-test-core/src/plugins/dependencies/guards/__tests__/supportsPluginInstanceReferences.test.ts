import { describe, expect, it } from "vitest";

import { supportsPluginInstanceReferences } from "../supportsPluginInstanceReferences.js";

import type { MountPlugin, PluginDefinition, PluginName } from "../../../../types";

function createMountPlugin(): MountPlugin {
  return {
    install: () => {},
  };
}

describe("supportsPluginInstanceReferences", () => {
  it("should return true when the plugin definition supports instance references", () => {
    const name = "dependencyA" as PluginName;

    const definition = {
      create: () => createMountPlugin(),
      supportsInstanceReferences: true,
    } satisfies PluginDefinition;

    expect(supportsPluginInstanceReferences(name, definition)).toBe(true);
  });

  it("should return false when the plugin definition does not declare instance reference support", () => {
    const name = "dependencyA" as PluginName;

    const definition = {
      create: () => createMountPlugin(),
    } satisfies PluginDefinition;

    expect(supportsPluginInstanceReferences(name, definition)).toBe(false);
  });
});
