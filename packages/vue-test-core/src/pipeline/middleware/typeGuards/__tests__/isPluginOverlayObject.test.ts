import { describe, it, expect } from "vitest";
import { isPluginOverlayObject } from "../isPluginOverlayObject";

describe("isPluginOverlayObject (runtime)", () => {
  describe("when given a valid overlay object", () => {
    it("should return true if the object is plain", () => {
      expect(isPluginOverlayObject({})).toBe(true);
    });

    it("should return true if the object contains __meta", () => {
      expect(isPluginOverlayObject({ __meta: { instance: {} } })).toBe(true);
    });

    it("should return true if the object has arbitrary keys", () => {
      expect(isPluginOverlayObject({ locale: "en", messages: {} })).toBe(true);
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
  });
});
