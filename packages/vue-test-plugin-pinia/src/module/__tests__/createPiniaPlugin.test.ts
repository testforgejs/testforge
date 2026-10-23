import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPiniaPlugin } from "../createPiniaPlugin.js";
import { withMockStores } from "../../helpers/withMockStores.js";
import { createPluginInstance } from "@testforgejs/vue-test-core";
import { createTestingPinia } from "@pinia/testing";

import type { TestingPinia } from "@pinia/testing";

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
    createPiniaPlugin(mockOptions);

    // Assert
    expect(createPluginInstance).toHaveBeenCalledWith(createTestingPinia, mockOptions);
  });

  it("should call withMockStores callback with the resolved Pinia instance", () => {
    // Arrange
    const mockStores = vi.fn();

    const mockOptions = {
      ...withMockStores(mockStores),
    };

    // Act
    const pinia = createPiniaPlugin(mockOptions);

    // Assert
    expect(mockStores).toHaveBeenCalledExactlyOnceWith(pinia);
  });

  it("should exclude the withMockStores symbol from options passed to createPluginInstance", () => {
    // Arrange
    const mockStores = vi.fn();

    const mockOptions = {
      stubActions: false,
      initialState: {
        counter: {
          count: 42,
        },
      },
      ...withMockStores(mockStores),
    };

    // Act
    createPiniaPlugin(mockOptions);

    // Assert
    expect(createPluginInstance).toHaveBeenCalledWith(createTestingPinia, {
      stubActions: false,
      initialState: {
        counter: {
          count: 42,
        },
      },
    });

    const [, pluginOptions] = vi.mocked(createPluginInstance).mock.calls[0];

    expect(Reflect.ownKeys(pluginOptions)).toEqual(["stubActions", "initialState"]);
  });

  it("should not invoke store setup when withMockStores is not provided", () => {
    // Arrange
    const mockOptions = {
      stubActions: false,
    };

    // Act
    const pinia = createPiniaPlugin(mockOptions);

    // Assert
    expect(pinia).toBeDefined();

    expect(createPluginInstance).toHaveBeenCalledExactlyOnceWith(createTestingPinia, mockOptions);
  });

  it("should apply withMockStores to an existing Pinia instance returned by createPluginInstance", () => {
    // Arrange
    const existingPinia = {
      id: "existing-pinia",
    } as unknown as TestingPinia;

    vi.mocked(createPluginInstance).mockReturnValueOnce(existingPinia);

    const mockStores = vi.fn();

    const mockOptions = {
      ...withMockStores(mockStores),
    };

    // Act
    const pinia = createPiniaPlugin(mockOptions);

    // Assert
    expect(pinia).toBe(existingPinia);

    expect(createPluginInstance).toHaveBeenCalledExactlyOnceWith(createTestingPinia, {});

    expect(mockStores).toHaveBeenCalledExactlyOnceWith(existingPinia);
  });

  it("should invoke withMockStores after resolving the Pinia instance", () => {
    // Arrange
    const calls: string[] = [];

    vi.mocked(createPluginInstance).mockImplementationOnce(() => {
      calls.push("createPluginInstance");

      return {
        id: "mocked-pinia",
      } as unknown as TestingPinia;
    });

    const mockStores = vi.fn(() => {
      calls.push("withMockStores");
    });

    // Act
    createPiniaPlugin({
      ...withMockStores(mockStores),
    });

    // Assert
    expect(calls).toEqual(["createPluginInstance", "withMockStores"]);
  });
});
