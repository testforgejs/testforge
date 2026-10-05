import { describe, expect, it, vi } from "vitest";

import { PLUGIN_INSTANCE_REFERENCE_TYPE } from "../../../../src/types";
import { fromPluginInstance } from "../../../../src/plugins/dependencies/fromPluginInstance";

declare module "../../../../src/types" {
  interface PluginInstanceMap {
    testPlugin: TestPluginInstance;
  }
}

interface TestPluginInstance {
  value: string;
}

describe("fromPluginInstance", () => {
  it("should create a plugin instance reference", () => {
    const resolve = vi.fn((instance: TestPluginInstance) => instance.value);

    const reference = fromPluginInstance("testPlugin", resolve);

    expect(reference).toEqual({
      __type: PLUGIN_INSTANCE_REFERENCE_TYPE,
      pluginName: "testPlugin",
      resolve,
    });
  });

  it("should preserve the resolver function", () => {
    const resolve = vi.fn((instance: TestPluginInstance) => instance.value);

    const reference = fromPluginInstance("testPlugin", resolve);

    expect(reference.resolve).toBe(resolve);
  });

  it("should not invoke the resolver when creating the reference", () => {
    const resolve = vi.fn((instance: TestPluginInstance) => instance.value);

    fromPluginInstance("testPlugin", resolve);

    expect(resolve).not.toHaveBeenCalled();
  });

  it("should create an immutable reference", () => {
    const reference = fromPluginInstance(
      "testPlugin",
      (instance: TestPluginInstance) => instance.value,
    );

    expect(Object.isFrozen(reference)).toBe(true);
  });
});
