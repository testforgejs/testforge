import { describe, it, expect, vi } from "vitest";
import { createPiniaPlugin } from "../createPiniaPlugin.js";
import { withMockStores } from "../../helpers/withMockStores.js";

describe("createPiniaPlugin integration", () => {
  it("should create a testing Pinia instance and apply withMockStores", () => {
    // Arrange
    const mockStores = vi.fn();

    const options = {
      createSpy: vi.fn,
      stubActions: true,
      ...withMockStores(mockStores),
    };

    // Act
    const pinia = createPiniaPlugin(options);

    // Assert
    expect(pinia).toBeDefined();
    expect(typeof pinia.install).toBe("function");

    expect(mockStores).toHaveBeenCalledExactlyOnceWith(pinia);
  });
});
