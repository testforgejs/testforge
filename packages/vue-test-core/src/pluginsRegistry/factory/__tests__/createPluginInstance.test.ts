import { describe, it, expect, vi } from "vitest";
import { createPluginInstance } from "../createPluginInstance.js";

import type { PluginRuntimeMeta } from "../../../types";

describe("createPluginInstance", () => {
  describe("factory usage", () => {
    it("should call factory with options when __sharedInstance is not provided", () => {
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

      expect(result).toBe(instance); // the same link
    });
  });

  describe("__sharedInstance reuse", () => {
    it("should NOT call factory when __sharedInstance is provided", () => {
      const shared = { shared: true };
      const factory = vi.fn();

      const result = createPluginInstance(factory, {
        __sharedInstance: shared,
      });

      expect(factory).not.toHaveBeenCalled();
      expect(result).toBe(shared);
    });

    it("should expose the shared instance via expose function", () => {
      const shared = { x: 1 };
      const expose = vi.fn();

      createPluginInstance(
        () => {
          throw new Error("factory should not be called");
        },
        {
          __sharedInstance: shared,
          expose,
        },
      );

      expect(expose).toHaveBeenCalledWith(shared);
    });
  });

  describe("expose contract", () => {
    it("should call expose with created instance when provided", () => {
      const instance = { a: 1 };
      const factory = vi.fn(() => instance);
      const expose = vi.fn();

      createPluginInstance(factory, { expose });

      expect(expose).toHaveBeenCalledTimes(1);
      expect(expose).toHaveBeenCalledWith(instance);
    });

    it("should do nothing when expose is missing", () => {
      const instance = { a: 1 };
      const factory = vi.fn(() => instance);

      expect(() => createPluginInstance(factory, {})).not.toThrow();
    });

    it("should do nothing when expose is not a function", () => {
      const instance = { a: 1 };
      const factory = vi.fn(() => instance);

      expect(() =>
        createPluginInstance(factory, { expose: 123 } as unknown as PluginRuntimeMeta<any>),
      ).not.toThrow();
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
  });
});
