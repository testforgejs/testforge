import { describe, it, expect } from "vitest";
import { isPluginOverlayObject } from "../isPluginOverlayObject";

describe("isPluginOverlayObject (runtime)", () => {
  describe("valid overlay objects", () => {
    it("returns true for plain object", () => {
      expect(isPluginOverlayObject({})).toBe(true);
    });

    it("returns true for object with __meta", () => {
      expect(isPluginOverlayObject({ __meta: { instance: {} } })).toBe(true);
    });

    it("returns true for object with arbitrary keys", () => {
      expect(isPluginOverlayObject({ locale: "en", messages: {} })).toBe(true);
    });
  });

  describe("invalid overlay values", () => {
    it("returns false for null", () => {
      expect(isPluginOverlayObject(null)).toBe(false);
    });

    it("returns false for array", () => {
      expect(isPluginOverlayObject([])).toBe(false);
    });

    it("returns false for boolean", () => {
      expect(isPluginOverlayObject(false)).toBe(false);
      expect(isPluginOverlayObject(true)).toBe(false);
    });

    it("returns false for string", () => {
      expect(isPluginOverlayObject("bad")).toBe(false);
    });

    it("returns false for number", () => {
      expect(isPluginOverlayObject(123)).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(isPluginOverlayObject(undefined)).toBe(false);
    });
  });
});
