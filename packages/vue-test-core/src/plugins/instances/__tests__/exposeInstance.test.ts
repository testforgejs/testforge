// packages/vue-test-core/src/plugins/instances/__tests__/exposeInstance.test.ts

import { describe, it, expect, vi } from "vitest";

import { exposeInstance } from "../exposeInstance.js";
import { PLUGIN_EXPOSE } from "../../../constants/constants.js";

import type { ExposeOption } from "../../../types.js";

describe("exposeInstance", () => {
  describe("when capture callback is provided", () => {
    it("should call the capture callback with the plugin instance", () => {
      const instance = { id: "plugin-instance" };
      const capture = vi.fn();

      exposeInstance(instance, {
        [PLUGIN_EXPOSE]: capture,
      });

      expect(capture).toHaveBeenCalledTimes(1);
      expect(capture).toHaveBeenCalledWith(instance);
    });
  });

  describe("when capture callback is missing or invalid", () => {
    it("should do nothing when options is undefined", () => {
      expect(() => exposeInstance({}, undefined)).not.toThrow();
    });

    it("should do nothing when capture callback is not a function", () => {
      const instance = {};

      const options = {
        [PLUGIN_EXPOSE]: "not-a-function",
      } as unknown as ExposeOption<typeof instance>;

      expect(() => exposeInstance(instance, options)).not.toThrow();
    });

    it("should do nothing when capture callback is null", () => {
      const instance = {};

      const options = {
        [PLUGIN_EXPOSE]: null,
      } as unknown as ExposeOption<typeof instance>;

      expect(() => exposeInstance(instance, options)).not.toThrow();
    });

    it("should ignore native expose while invoking the internal capture callback", () => {
      const instance = { id: "plugin-instance" };

      const nativeExpose = vi.fn();
      const capture = vi.fn();

      const options = {
        expose: nativeExpose,
        [PLUGIN_EXPOSE]: capture,
      };

      exposeInstance(instance, options);

      expect(capture).toHaveBeenCalledExactlyOnceWith(instance);
      expect(nativeExpose).not.toHaveBeenCalled();
    });
  });

  describe("immutability contract", () => {
    it("should not mutate instance or options", () => {
      const instance = { a: 1 };
      const capture = vi.fn();

      const options = {
        [PLUGIN_EXPOSE]: capture,
      };

      exposeInstance(instance, options);

      expect(instance).toEqual({ a: 1 });
      expect(Reflect.ownKeys(options)).toEqual([PLUGIN_EXPOSE]);
      expect(options[PLUGIN_EXPOSE]).toBe(capture);

      expect(capture).toHaveBeenCalledExactlyOnceWith(instance);
    });
  });
});
