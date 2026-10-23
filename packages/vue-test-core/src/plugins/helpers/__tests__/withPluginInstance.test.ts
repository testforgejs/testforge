import { describe, expect, it } from "vitest";

import { PLUGIN_META_KEY } from "../../../constants/constants.js";
import { withPluginInstance } from "../withPluginInstance.js";

describe("withPluginInstance", () => {
  it("should return symbol-keyed metadata containing the provided instance", () => {
    // Arrange
    const instance = {
      install() {},
    };

    // Act
    const result = withPluginInstance(instance);

    // Assert
    expect(result).toEqual({
      [PLUGIN_META_KEY]: {
        instance,
      },
    });
  });

  it("should preserve the provided instance identity", () => {
    // Arrange
    const instance = {
      install() {},
    };

    // Act
    const result = withPluginInstance(instance);

    // Assert
    expect(result[PLUGIN_META_KEY].instance).toBe(instance);
  });

  it("should expose only the internal symbol as an own property", () => {
    // Arrange
    const instance = {
      install() {},
    };

    // Act
    const result = withPluginInstance(instance);

    // Assert
    expect(Reflect.ownKeys(result)).toEqual([PLUGIN_META_KEY]);
  });

  it("should preserve metadata when spread into plugin options", () => {
    // Arrange
    const instance = {
      install() {},
    };

    // Act
    const options = {
      nativeOption: "value",
      ...withPluginInstance(instance),
    };

    // Assert
    expect(options.nativeOption).toBe("value");
    expect(options[PLUGIN_META_KEY].instance).toBe(instance);

    expect(Reflect.ownKeys(options)).toEqual(["nativeOption", PLUGIN_META_KEY]);
  });

  it("should define metadata as an enumerable property", () => {
    // Arrange
    const instance = {
      install() {},
    };

    // Act
    const result = withPluginInstance(instance);

    // Assert
    const descriptor = Object.getOwnPropertyDescriptor(result, PLUGIN_META_KEY);

    expect(descriptor).toEqual({
      value: {
        instance,
      },
      writable: true,
      enumerable: true,
      configurable: true,
    });
  });

  it("should create independent metadata containers for separate calls", () => {
    // Arrange
    const instance = {
      install() {},
    };

    // Act
    const firstResult = withPluginInstance(instance);
    const secondResult = withPluginInstance(instance);

    // Assert
    expect(firstResult).not.toBe(secondResult);

    expect(firstResult[PLUGIN_META_KEY]).not.toBe(secondResult[PLUGIN_META_KEY]);

    expect(firstResult[PLUGIN_META_KEY].instance).toBe(instance);
    expect(secondResult[PLUGIN_META_KEY].instance).toBe(instance);
  });
});
