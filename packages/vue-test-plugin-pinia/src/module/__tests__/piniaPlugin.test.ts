import { describe, it, expect, vi } from "vitest";

vi.mock("pinia", () => ({
  setActivePinia: vi.fn(),
}));

import { setActivePinia, Pinia } from "pinia";
import { piniaPlugin } from "../piniaPlugin.js";
import { createPiniaPlugin } from "../createPiniaPlugin.js";

describe("piniaPlugin", () => {
  it("should return 'pinia' as plugin name when getName is called", () => {
    // Act & Assert
    expect(piniaPlugin.getName()).toBe("pinia");
  });

  it("should return definition containing createPiniaPlugin when getDefinition is called", () => {
    // Act
    const definition = piniaPlugin.getDefinition();

    // Assert
    expect(definition.create).toBe(createPiniaPlugin);
  });

  it("should call setActivePinia with created instance in afterCreate hook", () => {
    // Arrange
    const pinia = {} as Pinia;

    const definition = piniaPlugin.getDefinition();

    // Act
    definition.afterCreate?.(
      pinia,
      {} as any, // ctx is not used by this hook
    );

    // Assert
    expect(setActivePinia).toHaveBeenCalledTimes(1);
    expect(setActivePinia).toHaveBeenCalledWith(pinia);
  });
});
