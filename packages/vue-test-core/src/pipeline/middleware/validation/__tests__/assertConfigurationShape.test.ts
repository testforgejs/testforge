import { describe, it, expect } from "vitest";
import { assertConfigurationShape } from "../assertConfigurationShape.js";
import { createMockCtx } from "../../../__tests__/fixtures.js";

describe("assertConfigurationShape middleware", () => {
  it("should pass when all fields are plain objects", () => {
    const validCtx = createMockCtx();

    expect(() => assertConfigurationShape(validCtx)).not.toThrow();
  });

  const cases = [
    ["defaultMountOptions", "string"],
    ["mountOptions", 123],
    ["extraOptions", true],
    ["defaultMountOptions", null],
    ["mountOptions", []],
    ["extraOptions", undefined],
  ] satisfies readonly ["defaultMountOptions" | "mountOptions" | "extraOptions", unknown][];

  it.each(cases)('throws when "%s" is invalid (%p)', (field, value) => {
    const ctx = createMockCtx({ [field]: value });

    expect(() => assertConfigurationShape(ctx)).toThrowError(
      new RegExp(`"${field}" must be an Object`),
    );
  });
});
