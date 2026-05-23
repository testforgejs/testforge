import { describe, it, expect } from "vitest";
import { mergeRecord } from "../mergeRecord";

describe("mergeRecord", () => {
  describe("when patch is not provided", () => {
    it("should return base as-is when patch is undefined", () => {
      const base = { a: 1 };

      const result = mergeRecord(base);

      expect(result).toBe(base);
    });
  });

  describe("merge semantics", () => {
    it("should override values from patch when they are defined", () => {
      const base = { a: 1, b: 2 };
      const patch = { a: 10 };

      const result = mergeRecord(base, patch);

      expect(result).toEqual({ a: 10, b: 2 });
    });

    it("should ignore patch values when they are undefined", () => {
      const base = { a: 1, b: 2 };
      const patch = { a: undefined };

      const result = mergeRecord(base, patch);

      expect(result).toEqual({ a: 1, b: 2 });
    });

    it("should keep fields from base when they are not in patch", () => {
      const base = { a: 1, b: 2 };
      const patch = { a: 5 };

      const result = mergeRecord(base, patch);

      expect(result.b).toBe(2);
    });

    it("should add new keys from patch when they are not in base", () => {
      const base = { a: 1 };
      const patch = { b: 2 } as any;

      const result = mergeRecord(base, patch);

      expect(result).toEqual({ a: 1, b: 2 });
    });
  });

  describe("immutability guarantees", () => {
    it("should return new object when patch is provided", () => {
      const base = { a: 1 };
      const patch = { a: 2 };

      const result = mergeRecord(base, patch);

      expect(result).not.toBe(base);
    });

    it("should not mutate base object", () => {
      const base = { a: 1 };
      const patch = { a: 2 };

      const result = mergeRecord(base, patch);

      expect(base).toEqual({ a: 1 });
      expect(result).toEqual({ a: 2 });
    });

    it("should not mutate patch object", () => {
      const base = { a: 1 };
      const patch = { a: 2 };

      mergeRecord(base, patch);

      expect(patch).toEqual({ a: 2 });
    });
  });
});
