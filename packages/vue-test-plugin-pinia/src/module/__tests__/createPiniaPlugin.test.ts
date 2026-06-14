import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPiniaPlugin } from "../createPiniaPlugin";
import { createPluginInstance } from "@testforge/vue-test-core";
import { setActivePinia } from "pinia";
import { createTestingPinia } from "@pinia/testing";

// Isolating external dependencies
vi.mock("@testforge/vue-test-core", () => ({
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

  it("should set created pinia instance as active when executed", () => {
    // Arrange
    const mockOptions = {};

    // Act
    const result = createPiniaPlugin(mockOptions as any);

    // Assert
    expect(setActivePinia).toHaveBeenCalledWith(result);
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

  it("should not call mockStores when mockStores is provided but __sharedInstance is true", () => {
    // Arrange
    const mockStores = vi.fn();
    const mockOptions = {
      mockStores,
      __sharedInstance: true,
    };

    // Act
    createPiniaPlugin(mockOptions as any);

    // Assert
    expect(mockStores).not.toHaveBeenCalled();
  });
});
