import { describe, expect, it, vi } from "vitest";
import { createVuePlugin } from "../createVuePlugin";

import type { Plugin } from "vue";

describe("createVuePlugin", () => {
  it("should return VTU compatible plugin tuple", () => {
    // Arrange
    const plugin = {
      install: vi.fn(),
    } satisfies Plugin;

    const options = {
      enabled: true,
      theme: "dark",
    };

    // Act
    const result = createVuePlugin(plugin, options);

    // Assert
    expect(result[0]).toBe(plugin);
    expect(result[1]).toBe(options);
  });

  it("should support install function plugins", () => {
    // Arrange
    const plugin: Plugin = () => {};

    const options = {
      locale: "en",
    };

    // Act
    const result = createVuePlugin(plugin, options);

    // Assert
    expect(result).toEqual([plugin, options]);
  });

  it("should throw when __sharedInstance is provided", () => {
    // Arrange
    const plugin = {
      install: vi.fn(),
    } satisfies Plugin;

    const options = {
      __sharedInstance: {},
    };

    // Act & Assert
    expect(() => createVuePlugin(plugin, options as any)).toThrow(
      "[TestForge] __sharedInstance is not supported for non-instance Vue plugins.",
    );
  });

  it("should throw when expose callback is provided", () => {
    // Arrange
    const plugin = {
      install: vi.fn(),
    } satisfies Plugin;

    const options = {
      expose: vi.fn(),
    };

    // Act & Assert
    expect(() => createVuePlugin(plugin, options as any)).toThrow(
      "[TestForge] expose() is not supported for non-instance Vue plugins",
    );
  });
});
