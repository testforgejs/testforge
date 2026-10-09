// packages/vue-test-core/src/pipeline/middleware/typeGuards/__tests__/isPluginOverlayObject.test.ts

import { describe, it, expect } from "vitest";
import { isPluginOverlayObject } from "../isPluginOverlayObject.js";

describe("isPluginOverlayObject (runtime)", () => {
  describe("when given a valid overlay object", () => {
    it("should return true if the object is plain", () => {
      expect(isPluginOverlayObject({})).toBe(true);
    });

    it("should return true if the object has arbitrary keys", () => {
      expect(isPluginOverlayObject({ locale: "en", messages: {} })).toBe(true);
    });

    describe("when __meta is provided", () => {
      it("should return true if __meta is an empty object", () => {
        expect(isPluginOverlayObject({ __meta: {} })).toBe(true);
      });

      it("should return true if __meta contains a plugin instance", () => {
        const instance = {
          install() {},
        };

        expect(isPluginOverlayObject({ __meta: { instance } })).toBe(true);
      });

      it("should return true if __meta is undefined", () => {
        expect(isPluginOverlayObject({ __meta: undefined })).toBe(true);
      });

      it("should return true if __meta.instance is undefined", () => {
        expect(isPluginOverlayObject({ __meta: { instance: undefined } })).toBe(true);
      });

      it("should return true if __meta.instance is null", () => {
        expect(isPluginOverlayObject({ __meta: { instance: null } })).toBe(true);
      });

      it("should return true if __meta.instance is a primitive value", () => {
        expect(isPluginOverlayObject({ __meta: { instance: 123 } })).toBe(true);
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

    describe("when __meta is invalid", () => {
      it("should return false if __meta is null", () => {
        expect(isPluginOverlayObject({ __meta: null })).toBe(false);
      });

      it("should return false if __meta is an array", () => {
        expect(isPluginOverlayObject({ __meta: [] })).toBe(false);
      });

      it("should return false if __meta is a boolean", () => {
        expect(isPluginOverlayObject({ __meta: false })).toBe(false);
        expect(isPluginOverlayObject({ __meta: true })).toBe(false);
      });

      it("should return false if __meta is a string", () => {
        expect(isPluginOverlayObject({ __meta: "invalid" })).toBe(false);
      });

      it("should return false if __meta is a number", () => {
        expect(isPluginOverlayObject({ __meta: 123 })).toBe(false);
      });
    });
  });
});
