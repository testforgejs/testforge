import { describe, it, expect } from "vitest";
import { assertPluginValue } from "../assertPluginValue.js";

describe("assertPluginValue (runtime)", () => {
  describe("when given an allowed value", () => {
    it("should not throw if the value is undefined", () => {
      expect(() => assertPluginValue(undefined, "i18n", "plugins")).not.toThrow();
    });

    it("should not throw if the value is false", () => {
      expect(() => assertPluginValue(false, "i18n", "plugins")).not.toThrow();
    });

    it("should not throw if the value is an object", () => {
      expect(() => assertPluginValue({ locale: "en" }, "i18n", "plugins")).not.toThrow();
    });
  });

  describe("when given an object-like invalid value", () => {
    it("should throw an error if the value is null", () => {
      expect(() => assertPluginValue(null, "i18n", "plugins")).toThrow();
    });

    it("should throw an error if the value is an array", () => {
      expect(() => assertPluginValue([], "i18n", "plugins")).toThrow();
    });
  });

  describe("when given a primitive invalid value", () => {
    it("should throw an error if the value is a string", () => {
      expect(() => assertPluginValue("bad", "i18n", "plugins")).toThrow();
    });

    it("should throw an error if the value is a number", () => {
      expect(() => assertPluginValue(123, "i18n", "plugins")).toThrow();
    });

    it("should throw an error if the value is true", () => {
      expect(() => assertPluginValue(true, "i18n", "plugins")).toThrow();
    });
  });
});
