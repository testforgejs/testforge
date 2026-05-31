import { describe, it, expect } from "vitest";
import { FRAMEWORK_NAME, ERROR_PREFIX, DEFAULT_PRESET_NAME } from "../constants.js";

describe("constants", () => {
  it("should expose framework name", () => {
    expect(FRAMEWORK_NAME).toBe("TestForge");
  });

  it("should derive error prefix from framework name", () => {
    expect(ERROR_PREFIX).toBe(`[${FRAMEWORK_NAME}]`);
  });

  it("should expose default preset name", () => {
    expect(DEFAULT_PRESET_NAME).toBe("default");
  });
});
