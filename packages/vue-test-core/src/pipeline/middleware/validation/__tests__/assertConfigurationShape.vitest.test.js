import { describe, it, expect } from "vitest";
import { assertConfigurationShape } from "../assertConfigurationShape.js";

describe("assertConfigurationShape middleware", () => {
  const validCtx = {
    defaultMountOptions: {},
    mountOptions: {},
    extraOptions: {},
  };

  it("should pass when all fields are plain objects", () => {
    expect(() => assertConfigurationShape(validCtx)).not.toThrow();
  });

  const cases = [
    ["defaultMountOptions", "string"],
    ["mountOptions", 123],
    ["extraOptions", true],
    ["defaultMountOptions", null],
    ["mountOptions", []],
    ["extraOptions", undefined],
  ];

  it.each(cases)('throws when "%s" is invalid (%p)', (field, value) => {
    const ctx = { ...validCtx, [field]: value };

    expect(() => assertConfigurationShape(ctx)).toThrowError(
      new RegExp(`"${field}" must be an Object`),
    );
  });
});
