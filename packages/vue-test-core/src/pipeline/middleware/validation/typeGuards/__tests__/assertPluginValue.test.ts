import { describe, it, expect } from "vitest";
import { assertPluginValue } from "../assertPluginValue.js";

describe("assertPluginValue (runtime)", () => {
  describe("allowed values", () => {
    it("allows undefined", () => {
      expect(() => assertPluginValue(undefined, "i18n", "plugins")).not.toThrow();
    });

    it("allows false", () => {
      expect(() => assertPluginValue(false, "i18n", "plugins")).not.toThrow();
    });

    it("allows object", () => {
      expect(() => assertPluginValue({ locale: "en" }, "i18n", "plugins")).not.toThrow();
    });
  });

  describe("rejects object-like invalid values", () => {
    it("throws for null", () => {
      expect(() => assertPluginValue(null, "i18n", "plugins")).toThrow();
    });

    it("throws for array", () => {
      expect(() => assertPluginValue([], "i18n", "plugins")).toThrow();
    });
  });

  describe("rejects primitive invalid values", () => {
    it("throws for string", () => {
      expect(() => assertPluginValue("bad", "i18n", "plugins")).toThrow();
    });

    it("throws for number", () => {
      expect(() => assertPluginValue(123, "i18n", "plugins")).toThrow();
    });

    it("throws for true", () => {
      expect(() => assertPluginValue(true, "i18n", "plugins")).toThrow();
    });
  });
});
