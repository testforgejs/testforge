import { describe, it, expect, vi } from "vitest";
import { createRouterPlugin } from "../createRouterPlugin.js";
import { createPluginInstance } from "@testforgejs/vue-test-core";
import { createRouter } from "vue-router";

// Isolating the external kernel factory
vi.mock("@testforgejs/vue-test-core", () => ({
  createPluginInstance: vi.fn((_fn, _opts) => "mocked-router-instance"),
}));

// Let's isolate vue-router
vi.mock("vue-router", () => ({
  createRouter: vi.fn(),
}));

describe("createRouterPlugin", () => {
  it("should call createPluginInstance with createRouter factory and options when executed", () => {
    // Arrange
    const mockOptions = { routes: [], history: {} as any };

    // Act
    const result = createRouterPlugin(mockOptions);

    // Assert
    expect(createPluginInstance).toHaveBeenCalledWith(createRouter, mockOptions);
    expect(result).toBe("mocked-router-instance");
  });
});
