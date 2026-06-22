import { describe, it, expect, vi } from "vitest";
import { exposeInstance } from "../exposeInstance.js";

import type { PluginRuntimeMeta } from "../../../types";

describe("exposeInstance", () => {
  describe("when expose callback is provided", () => {
    it("should call expose with the plugin instance", () => {
      const instance = { id: "plugin-instance" };
      const expose = vi.fn();

      exposeInstance(instance, { expose });

      expect(expose).toHaveBeenCalledTimes(1);
      expect(expose).toHaveBeenCalledWith(instance);
    });
  });

  describe("when expose is missing or invalid", () => {
    it("should do nothing when options is undefined", () => {
      expect(() => exposeInstance({}, undefined)).not.toThrow();
    });

    it("should do nothing when expose is not a function", () => {
      expect(() =>
        exposeInstance({}, { expose: "not-a-function" } as unknown as PluginRuntimeMeta<any>),
      ).not.toThrow();
    });

    it("should do nothing when expose is null", () => {
      expect(() =>
        exposeInstance({}, { expose: null } as unknown as PluginRuntimeMeta<any>),
      ).not.toThrow();
    });
  });

  describe("immutability contract", () => {
    it("should not mutate instance or options", () => {
      const instance = { a: 1 };
      const expose = vi.fn();
      const options = { expose };

      const instanceRef = instance;
      const optionsRef = options;

      exposeInstance(instance, options);

      expect(instance).toBe(instanceRef);
      expect(options).toBe(optionsRef);

      expect(instance).toEqual({ a: 1 });
      expect(options.expose).toBe(expose);
    });
  });
});
