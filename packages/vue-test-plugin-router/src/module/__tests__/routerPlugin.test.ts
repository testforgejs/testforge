import { describe, it, expect } from "vitest";
import { routerPlugin } from "../routerPlugin.js";
import { createRouterPlugin } from "../createRouterPlugin.js";

describe("routerPlugin", () => {
  it("should return 'router' as plugin name when getName is called", () => {
    // Act & Assert
    expect(routerPlugin.getName()).toBe("router");
  });

  it("should return definition containing createRouterPlugin when getDefinition is called", () => {
    // Act
    const definition = routerPlugin.getDefinition();

    // Assert
    expect(definition.create).toBe(createRouterPlugin);
  });
});
