import { describe, it, expect } from "vitest";
import { assertResultShape } from "../assertResultShape.js";

describe("assertResultShape middleware", () => {
  const validCtx = {
    result: {
      mountOptions: {},
      global: {},
      plugins: {},
    },
  };

  it("should pass when result shape is valid", () => {
    expect(() => assertResultShape(validCtx)).not.toThrow();
  });

  it("throws when result is missing", () => {
    expect(() => assertResultShape({})).toThrow("[pipeline] result must be an object");
  });

  it("should throw when result.mountOptions is invalid", () => {
    const ctx = {
      result: {
        mountOptions: null,
        global: {},
        plugins: {},
      },
    };

    expect(() => assertResultShape(ctx)).toThrow(
      "[pipeline] result.mountOptions must be an object",
    );
  });

  it("should throw when result.global is invalid", () => {
    const ctx = {
      result: {
        mountOptions: {},
        global: undefined,
        plugins: {},
      },
    };

    expect(() => assertResultShape(ctx)).toThrow("[pipeline] result.global must be an object");
  });

  it("should throw when result.plugins is invalid", () => {
    const ctx = {
      result: {
        mountOptions: {},
        global: {},
        plugins: 123,
      },
    };

    expect(() => assertResultShape(ctx)).toThrow("[pipeline] result.plugins must be an object");
  });
});
