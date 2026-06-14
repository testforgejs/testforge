import { describe, it, expect } from "vitest";
import { piniaPlugin } from "../piniaPlugin";
import { createPiniaPlugin } from "../createPiniaPlugin";

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
});
