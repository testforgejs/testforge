import { describe, expect, it } from "@jest/globals";
import { presets } from "../presets.js";
import { validatePresets } from "@testforgejs/vue-test-core";

describe("validate recommended presets", () => {
  it("should pass preset validation", () => {
    expect(() => validatePresets(presets)).not.toThrow();
  });
});
