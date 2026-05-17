import { describe, it, expect } from "vitest";
import { mergeConfigs } from "../mergeConfigs.js";

describe("mergeConfigs", () => {
  describe("basic merging", () => {
    it("should combine simple objects when they have unique keys", () => {
      const base = { keyA: 1, keyB: 2 };
      const override = { keyB: 3, keyC: 4 };
      expect(mergeConfigs(base, override)).toEqual({
        keyA: 1,
        keyB: 3,
        keyC: 4,
      });
    });

    it("should replace primitives with source value", () => {
      const base = {
        num: 1,
        str: "old",
        bool: true,
        nul: null,
      };
      const override = {
        num: 42,
        str: "new",
        bool: false,
        nul: undefined,
      };

      const result = mergeConfigs(base, override);

      expect(result.num).toBe(42);
      expect(result.str).toBe("new");
      expect(result.bool).toBe(false);
      expect(result.nul).toBe(undefined);
    });

    it("should replace primitive with deep object", () => {
      const base = { a: 1 };
      const override = { a: { b: 2 } };

      const result = mergeConfigs(base, override);

      expect(result.a).toEqual({ b: 2 });
    });
  });

  describe("nested objects", () => {
    it("should perform recursive merge when nested objects are present", () => {
      const base = {
        global: { stubs: { Btn: true }, mocks: { $t: () => {} } },
      };
      const override = { global: { stubs: { Icon: true } } };

      const result = mergeConfigs(base, override);
      expect(result.global.stubs).toEqual({ Btn: true, Icon: true });
      expect(result.global.mocks).toBeDefined();
    });

    it("should create new object when recursively merging nested objects", () => {
      const base = { a: { b: 1 } };
      const override = { a: { c: 2 } };

      const result = mergeConfigs(base, override);

      expect(result.a).not.toBe(base.a);
      expect(result.a).not.toBe(override.a);
      expect(result.a).toEqual({ b: 1, c: 2 });
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

      const result = mergeConfigs(base, override);

      expect(result).toEqual({
        a: {
          b: {
            c: 1,
            d: 2,
          },
        },
      });
    });
  });

  describe("arrays", () => {
    it("should concatenate arrays and remove duplicates when both values are arrays", () => {
      const base = { plugins: ["plugin-1", "plugin-2"] };
      const override = { plugins: ["plugin-2", "plugin-3"] };

      expect(mergeConfigs(base, override).plugins).toEqual(["plugin-1", "plugin-2", "plugin-3"]);
    });

    it("should merge arrays at root level", () => {
      expect(mergeConfigs([1, 2], [2, 3])).toEqual([1, 2, 3]);
    });

    it("should deduplicate array values of different types correctly", () => {
      const base = { arr: [1, "1"] };
      const override = { arr: ["1", 2] };

      const result = mergeConfigs(base, override);

      expect(result.arr).toEqual([1, "1", 2]);
    });

    it("should not deduplicate different object references in arrays", () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };

      const base = { arr: [obj1] };
      const override = { arr: [obj2] };

      const result = mergeConfigs(base, override);

      expect(result.arr).toHaveLength(2); // because Set compares by reference
    });
  });

  describe("type conflicts", () => {
    it("should replace value when types differ (object with primitive, primitive with object, etc.)", () => {
      const cases = [
        { base: { a: { b: 1 } }, override: { a: false }, expected: false },
        { base: { a: 123 }, override: { a: { b: 2 } }, expected: { b: 2 } },
        { base: { a: ["x"] }, override: { a: null }, expected: null },
        { base: { a: true }, override: { a: [1, 2] }, expected: [1, 2] },
      ];

      cases.forEach(({ base, override, expected }) => {
        const result = mergeConfigs(base, override);
        expect(result.a).toEqual(expected); // или toBe() для примитивов
      });
    });

    it("should replace an array with a primitive value", () => {
      const base = { router: ["old"] };
      const override = { router: false };

      const result = mergeConfigs(base, override);

      expect(result.router).toBe(false);
    });

    it("should replace a primitive value with an array", () => {
      const base = { router: false };
      const override = { router: ["new"] };

      const result = mergeConfigs(base, override);

      expect(result.router).toEqual(["new"]);
    });
  });

  describe("references and mutation", () => {
    it("should not mutate target object", () => {
      const base = { a: { b: 1 } };
      const override = { a: { c: 2 } };

      const result = mergeConfigs(base, override);

      expect(base).toEqual({ a: { b: 1 } });
      expect(result).not.toBe(base);
      expect(result.a).not.toBe(base.a);
    });

    it("should create shallow copy of target object", () => {
      const base = { a: { b: 1 } };

      const result = mergeConfigs(base, {});

      expect(result).not.toBe(base);
      expect(result.a).toBe(base.a);
    });

    it("should preserve references for keys not involved in merge", () => {
      const base = { a: { b: 1 } };
      const result = mergeConfigs(base, {});

      expect(result.a).toBe(base.a); // Fixing the contract
    });

    it("should reuse source object references when target has no such key", () => {
      const override = { a: { b: 1 } };
      const result = mergeConfigs({}, override);

      expect(result.a).toBe(override.a); // Fixing the contract
    });

    it("should not mutate source object", () => {
      const base = { a: { b: 1 } };
      const override = { a: { c: 2 } };

      mergeConfigs(base, override);

      expect(override).toEqual({ a: { c: 2 } });
    });
  });

  describe("edge cases", () => {
    it("should return source if target is not an object", () => {
      expect(mergeConfigs(null, { a: 1 })).toEqual({ a: 1 });
      expect(mergeConfigs(undefined, { a: 1 })).toEqual({ a: 1 });
      expect(mergeConfigs(42, { a: 1 })).toEqual({ a: 1 });
    });

    it("should return source if source is not an object", () => {
      expect(mergeConfigs({ a: 1 }, null)).toBe(null);
      expect(mergeConfigs({ a: 1 }, 42)).toBe(42);
      expect(mergeConfigs({ a: 1 }, "test")).toBe("test");
    });

    it("should handle empty objects correctly", () => {
      expect(mergeConfigs({}, { a: 1 })).toEqual({ a: 1 });
      expect(mergeConfigs({ a: 1 }, {})).toEqual({ a: 1 });
    });

    it("should overwrite with undefined values", () => {
      const base = { a: 1 };
      const override = { a: undefined };

      const result = mergeConfigs(base, override);

      expect(result).toHaveProperty("a", undefined);
    });
  });

  it("should add undefined keys from source", () => {
    const result = mergeConfigs({}, { a: undefined });
    expect(result).toHaveProperty("a", undefined);
  });
});
