import { describe, it, expect, vi } from "vitest";
import { createVuetifyPlugin } from "../createVuetifyPlugin.js";
import { createPluginInstance } from "@testforge/vue-test-core";
import { createVuetify } from "vuetify";

vi.mock("@testforge/vue-test-core", () => ({
  createPluginInstance: vi.fn((_fn, _opts) => "mocked-vuetify-instance"),
}));

vi.mock("vuetify", () => ({
  createVuetify: vi.fn(),
}));

describe("createVuetifyPlugin", () => {
  it("should call createPluginInstance with createVuetify factory and options when executed", () => {
    // Arrange
    const mockOptions = {
      theme: {
        defaultTheme: "light",
      },
    };

    // Act
    const result = createVuetifyPlugin(mockOptions);

    // Assert
    expect(createPluginInstance).toHaveBeenCalledWith(createVuetify, mockOptions);

    expect(result).toBe("mocked-vuetify-instance");
  });
});
