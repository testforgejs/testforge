import { describe, it, expect } from "vitest";
import { deepMerge } from "../deepMerge.js";

describe("deepMerge", () => {
  it("should combine simple objects when they have unique keys", () => {
    const base = { keyA: 1, keyB: 2 };
    const override = { keyB: 3, keyC: 4 };
    expect(deepMerge(base, override)).toEqual({ keyA: 1, keyB: 3, keyC: 4 });
  });

  it("should perform recursive merge when nested objects are present", () => {
    const base = {
      global: { stubs: { Btn: true }, mocks: { $t: () => {} } },
    };
    const override = { global: { stubs: { Icon: true } } };

    const result = deepMerge(base, override);
    expect(result.global.stubs).toEqual({ Btn: true, Icon: true });
    expect(result.global.mocks).toBeDefined();
  });

  it("should concatenate arrays and remove duplicates when both values are arrays", () => {
    const base = { plugins: ["plugin-1", "plugin-2"] };
    const override = { plugins: ["plugin-2", "plugin-3"] };

    expect(deepMerge(base, override).plugins).toEqual([
      "plugin-1",
      "plugin-2",
      "plugin-3",
    ]);
  });

  describe("when merging different data types", () => {
    it("should replace an array with a primitive value", () => {
      const base = { router: ["old"] };
      const override = { router: false };

      const result = deepMerge(base, override);

      expect(result.router).toBe(false);
    });

    it("should replace a primitive value with an array", () => {
      const base = { router: false };
      const override = { router: ["new"] };

      const result = deepMerge(base, override);

      expect(result.router).toEqual(["new"]);
    });
  });

  describe("edge cases", () => {
    it("should not mutate target object", () => {
      const base = { a: { b: 1 } };
      const override = { a: { c: 2 } };

      const result = deepMerge(base, override);

      expect(base).toEqual({ a: { b: 1 } });
      expect(result).not.toBe(base);
      expect(result.a).not.toBe(base.a);
    });

    it("should return source if target is not an object", () => {
      expect(deepMerge(null, { a: 1 })).toEqual({ a: 1 });
      expect(deepMerge(undefined, { a: 1 })).toEqual({ a: 1 });
      expect(deepMerge(42, { a: 1 })).toEqual({ a: 1 });
    });

    it("should return source if source is not an object", () => {
      expect(deepMerge({ a: 1 }, null)).toBe(null);
      expect(deepMerge({ a: 1 }, 42)).toBe(42);
      expect(deepMerge({ a: 1 }, "test")).toBe("test");
    });

    it("should merge arrays at root level", () => {
      expect(deepMerge([1, 2], [2, 3])).toEqual([1, 2, 3]);
    });

    it("should handle empty objects correctly", () => {
      expect(deepMerge({}, { a: 1 })).toEqual({ a: 1 });
      expect(deepMerge({ a: 1 }, {})).toEqual({ a: 1 });
    });

    it("should overwrite with undefined values", () => {
      const base = { a: 1 };
      const override = { a: undefined };

      const result = deepMerge(base, override);

      expect(result).toHaveProperty("a", undefined);
    });

    it("should handle deeply nested structures", () => {
      const base = {
        a: {
          b: {
            c: 1,
          },
        },
      };

      const override = {
        a: {
          b: {
            d: 2,
          },
        },
      };

      const result = deepMerge(base, override);

      expect(result).toEqual({
        a: {
          b: {
            c: 1,
            d: 2,
          },
        },
      });
    });

    it("should deduplicate array values of different types correctly", () => {
      const base = { arr: [1, "1"] };
      const override = { arr: ["1", 2] };

      const result = deepMerge(base, override);

      expect(result.arr).toEqual([1, "1", 2]);
    });
  });

  it("should not mutate source object", () => {
    const base = { a: { b: 1 } };
    const override = { a: { c: 2 } };

    deepMerge(base, override);

    expect(override).toEqual({ a: { c: 2 } });
  });
});
