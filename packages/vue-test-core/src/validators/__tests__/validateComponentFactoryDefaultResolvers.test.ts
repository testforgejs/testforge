import { describe, it, expect, vi } from "vitest";

import { ERROR_PREFIX } from "../../constants/constants.js";
import { validateComponentFactoryDefaultResolvers } from "../validateComponentFactoryDefaultResolvers.js";

describe("validateComponentFactoryDefaultResolvers", () => {
  const resolver = () => ({});

  it("should accept omitted resolvers", () => {
    expect(() =>
      validateComponentFactoryDefaultResolvers(undefined, undefined, undefined),
    ).not.toThrow();
  });

  it("should accept valid resolvers", () => {
    expect(() =>
      validateComponentFactoryDefaultResolvers(resolver, resolver, resolver),
    ).not.toThrow();
  });

  it("should accept independently omitted resolvers", () => {
    expect(() =>
      validateComponentFactoryDefaultResolvers(resolver, undefined, undefined),
    ).not.toThrow();

    expect(() =>
      validateComponentFactoryDefaultResolvers(undefined, resolver, undefined),
    ).not.toThrow();

    expect(() =>
      validateComponentFactoryDefaultResolvers(undefined, undefined, resolver),
    ).not.toThrow();
  });

  it.each([
    ["defaultProps", 0],
    ["defaultMountOptions", 1],
    ["defaultSlots", 2],
  ] as const)("should reject invalid %s resolver", (name, index) => {
    const invalidValues = [null, false, true, 123, "invalid", {}, []];

    for (const value of invalidValues) {
      const args: [unknown, unknown, unknown] = [resolver, resolver, resolver];

      args[index] = value;

      expect(() => validateComponentFactoryDefaultResolvers(...args)).toThrow(
        `${ERROR_PREFIX} "${name}" must be a function.`,
      );
    }
  });

  it("should not invoke resolvers during validation", () => {
    const resolveProps = vi.fn(() => ({}));
    const resolveMountOptions = vi.fn(() => ({}));
    const resolveSlots = vi.fn(() => ({}));

    validateComponentFactoryDefaultResolvers(resolveProps, resolveMountOptions, resolveSlots);

    expect(resolveProps).not.toHaveBeenCalled();
    expect(resolveMountOptions).not.toHaveBeenCalled();
    expect(resolveSlots).not.toHaveBeenCalled();
  });

  it("should reject the first invalid resolver", () => {
    expect(() => validateComponentFactoryDefaultResolvers(resolver, null, "invalid")).toThrow(
      `${ERROR_PREFIX} "defaultMountOptions" must be a function.`,
    );
  });
});
