import { describe, it, expect, vi } from "vitest";

vi.mock("@testforge/vue-test-core", () => ({
  createPluginInstance: vi.fn(),
}));

import { createPluginInstance } from "@testforge/vue-test-core";
import { createI18nPlugin } from "../createI18nPlugin";

describe("createI18nPlugin", () => {
  it("should delegate plugin creation to createPluginInstance", () => {
    const instance = { install: vi.fn() };

    createPluginInstance.mockReturnValue(instance);

    const options = {
      locale: "en",
      messages: {},
    };

    const result = createI18nPlugin(options);

    expect(createPluginInstance).toHaveBeenCalledTimes(1);
    expect(result).toBe(instance);
  });
});
