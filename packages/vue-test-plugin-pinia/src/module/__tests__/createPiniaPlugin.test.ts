import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPiniaPlugin } from "../createPiniaPlugin.js";
import { createPluginInstance } from "@testforgejs/vue-test-core";
import { createTestingPinia } from "@pinia/testing";

// Isolating external dependencies
vi.mock("@testforgejs/vue-test-core", () => ({
  createPluginInstance: vi.fn(() => ({ id: "mocked-pinia" })),
}));

vi.mock("pinia", () => ({
  setActivePinia: vi.fn(),
}));

vi.mock("@pinia/testing", () => ({
  createTestingPinia: vi.fn(),
}));

describe("createPiniaPlugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call createPluginInstance with createTestingPinia factory and options when executed", () => {
    // Arrange
    const mockOptions = { stubActions: true };

    // Act
    createPiniaPlugin(mockOptions as any);

    // Assert
    expect(createPluginInstance).toHaveBeenCalledWith(createTestingPinia, mockOptions);
  });

  it("should call mockStores with pinia instance when mockStores is provided and __sharedInstance is false", () => {
    // Arrange
    const mockStores = vi.fn();
    const mockOptions = {
      mockStores,
      __sharedInstance: false,
    };

    // Act
    createPiniaPlugin(mockOptions as any);

    // Assert
    expect(mockStores).toHaveBeenCalled();
  });
});
