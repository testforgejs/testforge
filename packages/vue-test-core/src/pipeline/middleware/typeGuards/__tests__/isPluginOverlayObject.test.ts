import { describe, it, expect } from "vitest";
import { isPluginOverlayObject } from "../isPluginOverlayObject.js";
import { PLUGIN_META_KEY } from "../../../../constants/constants.js";

describe("isPluginOverlayObject (runtime)", () => {
  describe("when given a valid overlay object", () => {
    it("should return true if the object is plain", () => {
      expect(isPluginOverlayObject({})).toBe(true);
    });

    it("should return true if the object has arbitrary keys", () => {
      expect(isPluginOverlayObject({ locale: "en", messages: {} })).toBe(true);
    });

    it("should treat the legacy __meta key as a regular plugin option", () => {
      const overlay = {
        __meta: {
          customOption: true,
        },
      };

      expect(isPluginOverlayObject(overlay)).toBe(true);
    });

    describe("when plugin metadata is provided", () => {
      it("should accept plugin metadata without an instance", () => {
        expect(isPluginOverlayObject({ [PLUGIN_META_KEY]: {} })).toBe(true);
      });

      it("should return true if plugin metadata contains a plugin instance", () => {
        const instance = {
          install() {},
        };

        expect(isPluginOverlayObject({ [PLUGIN_META_KEY]: { instance } })).toBe(true);
      });

      it("should return true if plugin metadata is undefined", () => {
        expect(isPluginOverlayObject({ [PLUGIN_META_KEY]: undefined })).toBe(true);
      });

      it("should return true if [PLUGIN_META_KEY].instance is undefined", () => {
        expect(isPluginOverlayObject({ [PLUGIN_META_KEY]: { instance: undefined } })).toBe(true);
      });

      it("should return true if [PLUGIN_META_KEY].instance is null", () => {
        expect(isPluginOverlayObject({ [PLUGIN_META_KEY]: { instance: null } })).toBe(true);
      });

      it("should return true if [PLUGIN_META_KEY].instance is a primitive value", () => {
        expect(isPluginOverlayObject({ [PLUGIN_META_KEY]: { instance: 123 } })).toBe(true);
      });
    });
  });

  describe("when given an invalid overlay value", () => {
    it("should return false if the value is null", () => {
      expect(isPluginOverlayObject(null)).toBe(false);
    });

    it("should return false if the value is an array", () => {
      expect(isPluginOverlayObject([])).toBe(false);
    });

    it("should return false if the value is a boolean", () => {
      expect(isPluginOverlayObject(false)).toBe(false);
      expect(isPluginOverlayObject(true)).toBe(false);
    });

    it("should return false if the value is a string", () => {
      expect(isPluginOverlayObject("bad")).toBe(false);
    });

    it("should return false if the value is a number", () => {
      expect(isPluginOverlayObject(123)).toBe(false);
    });

    it("should return false if the value is undefined", () => {
      expect(isPluginOverlayObject(undefined)).toBe(false);
    });

    describe("when plugin metadata is invalid", () => {
      it("should return false if plugin metadata is null", () => {
        expect(isPluginOverlayObject({ [PLUGIN_META_KEY]: null })).toBe(false);
      });

      it("should return false if plugin metadata is an array", () => {
        expect(isPluginOverlayObject({ [PLUGIN_META_KEY]: [] })).toBe(false);
      });

      it("should return false if plugin metadata is a boolean", () => {
        expect(isPluginOverlayObject({ [PLUGIN_META_KEY]: false })).toBe(false);
        expect(isPluginOverlayObject({ [PLUGIN_META_KEY]: true })).toBe(false);
      });

      it("should return false if plugin metadata is a string", () => {
        expect(isPluginOverlayObject({ [PLUGIN_META_KEY]: "invalid" })).toBe(false);
      });

      it("should return false if plugin metadata is a number", () => {
        expect(isPluginOverlayObject({ [PLUGIN_META_KEY]: 123 })).toBe(false);
      });
    });
  });
});
