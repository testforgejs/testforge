import { describe, it, expect } from "vitest";
import { assertResultShape } from "../assertResultShape.js";
import { ERROR_PREFIX } from "../../../../constants/constants.js";

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
    expect(() => assertResultShape({})).toThrow(
      `${ERROR_PREFIX} Critical error: "result" must be an Object. Received undefined (undefined)`,
    );
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
      `${ERROR_PREFIX} Critical error: "result.mountOptions" must be an Object. Received object (null)`,
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

    expect(() => assertResultShape(ctx)).toThrow(
      `${ERROR_PREFIX} Critical error: "result.global" must be an Object. Received undefined (undefined)`,
    );
  });

  it("should throw when result.plugins is invalid", () => {
    const ctx = {
      result: {
        mountOptions: {},
        global: {},
        plugins: 123,
      },
    };

    expect(() => assertResultShape(ctx)).toThrow(
      `${ERROR_PREFIX} Critical error: "result.plugins" must be an Object. Received number (123)`,
    );
  });
});
