import { describe, it, expect, vi } from "vitest";

import { createPluginInstance } from "../createPluginInstance.js";
import { captureInstance } from "../captureInstance.js";

import { PLUGIN_EXPOSE, SHARED_PLUGIN_INSTANCE_KEY } from "../../../constants/constants.js";

describe("createPluginInstance", () => {
  describe("factory usage", () => {
    it("should call factory with options when shared instance is not provided", () => {
      const factory = vi.fn(() => ({ id: 1 }));
      const options = { a: 123 };

      const result = createPluginInstance(factory, options);

      expect(factory).toHaveBeenCalledTimes(1);
      expect(factory).toHaveBeenCalledWith(options);
      expect(result).toEqual({ id: 1 });
    });

    it("should return factory result as instance", () => {
      const instance = { foo: "bar" };
      const factory = vi.fn(() => instance);

      const result = createPluginInstance(factory, {});

      expect(result).toBe(instance);
    });
  });

  describe("shared instance reuse", () => {
    it("should NOT call factory when shared instance is provided", () => {
      const shared = { shared: true };
      const factory = vi.fn();

      const result = createPluginInstance(factory, {
        [SHARED_PLUGIN_INSTANCE_KEY]: shared,
      });

      expect(factory).not.toHaveBeenCalled();
      expect(result).toBe(shared);
    });

    it("should capture the shared instance when shared instance is provided", () => {
      const shared = { x: 1 };
      const capture = captureInstance<typeof shared>();

      const factory = vi.fn(() => {
        throw new Error("factory should not be called");
      });

      const result = createPluginInstance(factory, {
        [SHARED_PLUGIN_INSTANCE_KEY]: shared,
        ...capture,
      });

      expect(factory).not.toHaveBeenCalled();
      expect(result).toBe(shared);
      expect(capture.instance).toBe(shared);
    });

    it("should not pass the internal shared-instance symbol to the native factory", () => {
      const instance = { a: 1 };
      const factory = vi.fn(() => instance);

      const result = createPluginInstance(factory, {
        nativeOption: "value",
        [SHARED_PLUGIN_INSTANCE_KEY]: undefined,
      });

      expect(factory).toHaveBeenCalledExactlyOnceWith({
        nativeOption: "value",
      });

      expect(result).toBe(instance);
    });
  });

  describe("instance capturing", () => {
    it("should capture the created instance when captureInstance is provided", () => {
      const instance = { a: 1 };
      const factory = vi.fn(() => instance);
      const capture = captureInstance<typeof instance>();

      const result = createPluginInstance(factory, {
        ...capture,
      });

      expect(factory).toHaveBeenCalledTimes(1);
      expect(result).toBe(instance);
      expect(capture.instance).toBe(instance);
    });

    it("should not capture the instance when captureInstance is not provided", () => {
      const instance = { a: 1 };
      const factory = vi.fn(() => instance);

      const result = createPluginInstance(factory, {});

      expect(factory).toHaveBeenCalledTimes(1);
      expect(result).toBe(instance);
    });

    it("should ignore an invalid internal capture callback", () => {
      const instance = { a: 1 };
      const factory = vi.fn(() => instance);

      const options = {
        [PLUGIN_EXPOSE]: 123,
      };

      expect(() => createPluginInstance(factory, options as never)).not.toThrow();

      expect(factory).toHaveBeenCalledTimes(1);
    });

    it("should not pass internal capture options to the native factory", () => {
      const instance = { a: 1 };
      const factory = vi.fn(() => instance);
      const capture = captureInstance<typeof instance>();

      createPluginInstance(factory, {
        nativeOption: "value",
        ...capture,
      });

      expect(factory).toHaveBeenCalledExactlyOnceWith({
        nativeOption: "value",
      });

      expect(capture.instance).toBe(instance);
    });
  });

  describe("native options compatibility", () => {
    it("should preserve native expose without invoking it as a capture callback", () => {
      const instance = { a: 1 };
      const factory = vi.fn(() => instance);
      const nativeExpose = vi.fn();
      const capture = captureInstance<typeof instance>();

      createPluginInstance(factory, {
        expose: nativeExpose,
        ...capture,
      });

      expect(factory).toHaveBeenCalledExactlyOnceWith({
        expose: nativeExpose,
      });

      expect(nativeExpose).not.toHaveBeenCalled();
      expect(capture.instance).toBe(instance);
    });

    it("should preserve native __sharedInstance without treating it as a shared instance", () => {
      const instance = { a: 1 };
      const factory = vi.fn(() => instance);

      const result = createPluginInstance(factory, {
        __sharedInstance: "native-value",
      });

      expect(factory).toHaveBeenCalledExactlyOnceWith({
        __sharedInstance: "native-value",
      });

      expect(result).toBe(instance);
    });
  });

  describe("immutability guarantees", () => {
    it("should not mutate options object", () => {
      const factory = vi.fn(() => ({}));
      const options = { a: 1 };
      const snapshot = { ...options };

      createPluginInstance(factory, options);

      expect(options).toEqual(snapshot);
    });

    it("should not remove the capture callback from the original options", () => {
      const instance = { a: 1 };
      const factory = vi.fn(() => instance);
      const capture = captureInstance<typeof instance>();

      const options = {
        a: 1,
        ...capture,
      };

      const originalKeys = Reflect.ownKeys(options);
      const originalCallback = options[PLUGIN_EXPOSE];

      createPluginInstance(factory, options);

      expect(Reflect.ownKeys(options)).toEqual(originalKeys);
      expect(options[PLUGIN_EXPOSE]).toBe(originalCallback);
      expect(capture.instance).toBe(instance);
    });
  });
});
