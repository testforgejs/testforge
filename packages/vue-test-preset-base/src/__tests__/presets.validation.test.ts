import { describe, it, expect } from "vitest";
import { presets } from "../presets.js";
import { validatePresets } from "@testforgejs/vue-test-core";

describe("presets", () => {
  describe("validation", () => {
    it("should pass preset validation", () => {
      expect(() => validatePresets(presets)).not.toThrow();
    });
  });
});
