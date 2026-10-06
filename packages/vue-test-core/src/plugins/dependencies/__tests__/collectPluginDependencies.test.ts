import { describe, expect, it } from "vitest";

import { collectPluginDependencies } from "../../../../src/plugins/dependencies/collectPluginDependencies.js";
import { fromPluginInstance } from "../../../../src/plugins/dependencies/fromPluginInstance.js";

import "./fixtures/pluginRegistry";

describe("collectPluginDependencies", () => {
  it("should return an empty array when the configuration contains no plugin instance references", () => {
    const dependencies = collectPluginDependencies("sourcePlugin", {
      enabled: true,
      nested: {
        value: "test",
      },
      items: [1, 2, 3],
    });

    expect(dependencies).toEqual([]);
  });

  it("should collect a plugin instance dependency", () => {
    const config = {
      adapter: fromPluginInstance("dependencyA", (instance) => instance.value),
    };

    const dependencies = collectPluginDependencies("sourcePlugin", config);

    expect(dependencies).toEqual([
      {
        pluginName: "sourcePlugin",
        dependsOn: "dependencyA",
      },
    ]);
  });

  it("should collect dependencies from nested objects and arrays", () => {
    const config = {
      nested: {
        adapter: fromPluginInstance("dependencyA", (instance) => instance.value),
      },
      items: [
        {
          adapter: fromPluginInstance("dependencyB", (instance) => instance.count),
        },
      ],
    };

    const dependencies = collectPluginDependencies("sourcePlugin", config);

    expect(dependencies).toEqual([
      {
        pluginName: "sourcePlugin",
        dependsOn: "dependencyA",
      },
      {
        pluginName: "sourcePlugin",
        dependsOn: "dependencyB",
      },
    ]);
  });

  it("should deduplicate dependencies on the same plugin instance", () => {
    const config = {
      first: fromPluginInstance("dependencyA", (instance) => instance.value),
      second: {
        reference: fromPluginInstance("dependencyA", (instance) => instance.value),
      },
    };

    const dependencies = collectPluginDependencies("sourcePlugin", config);

    expect(dependencies).toEqual([
      {
        pluginName: "sourcePlugin",
        dependsOn: "dependencyA",
      },
    ]);
  });

  it("should preserve self-dependencies for later graph validation", () => {
    const config = {
      value: fromPluginInstance("dependencyA", (instance) => instance.value),
    };

    const dependencies = collectPluginDependencies("dependencyA", config);

    expect(dependencies).toEqual([
      {
        pluginName: "dependencyA",
        dependsOn: "dependencyA",
      },
    ]);
  });

  it("should not traverse non-plain objects", () => {
    class CustomConfig {
      reference = fromPluginInstance("dependencyA", (instance) => instance.value);
    }

    const config = {
      custom: new CustomConfig(),
    };

    const dependencies = collectPluginDependencies("sourcePlugin", config);

    expect(dependencies).toEqual([]);
  });

  it("should handle cyclic configuration structures", () => {
    const config: Record<string, unknown> = {
      reference: fromPluginInstance("dependencyA", (instance) => instance.value),
    };

    config.self = config;

    const dependencies = collectPluginDependencies("sourcePlugin", config);

    expect(dependencies).toEqual([
      {
        pluginName: "sourcePlugin",
        dependsOn: "dependencyA",
      },
    ]);
  });

  it("should return an immutable dependency collection", () => {
    const dependencies = collectPluginDependencies("sourcePlugin", {
      reference: fromPluginInstance("dependencyA", (instance) => instance.value),
    });

    expect(Object.isFrozen(dependencies)).toBe(true);
    expect(Object.isFrozen(dependencies[0])).toBe(true);
  });
});
