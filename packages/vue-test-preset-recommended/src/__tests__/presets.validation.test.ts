import { describe, expect, it } from "vitest";
import { presets } from "../presets.js";
import { validatePresets } from "@testforgejs/vue-test-core";

describe("validate recommended presets", () => {
  it("should pass preset validation", () => {
    expect(() => validatePresets(presets)).not.toThrow();
  });
});
