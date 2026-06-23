import { describe, it, expect } from "vitest";
import { mergeComponentData } from "../mergeComponentData.js";

type Data = Record<string, number>;

describe("mergeComponentData", () => {
  describe("merging priority", () => {
    it("should respect priority: direct > mount > defaultData > defaultMountData", () => {
      const result = mergeComponentData({
        defaultMountData: { k: 1 },
        defaultData: { k: 2 },
        mountData: { k: 3 },
        directData: { k: 4 },
      });

      expect(result.k).toBe(4);
    });

    it("should override directData over mountData within level 2", () => {
      const result = mergeComponentData({
        mountData: { a: 1 },
        directData: { a: 2 },
      });

      expect(result.a).toBe(2);
    });

    it("should override defaultData over defaultMountData within level 1", () => {
      const result = mergeComponentData({
        defaultMountData: { a: 1 },
        defaultData: { a: 2 },
      });

      expect(result.a).toBe(2);
    });

    it("should perform only shallow merge (no deep merge)", () => {
      const result = mergeComponentData({
        defaultData: { obj: { a: 1 } },
        directData: { obj: { b: 2 } },
      });

      expect(result.obj).toEqual({ b: 2 }); // не { a:1, b:2 }
    });
  });

  describe("skip flags", () => {
    it("should ignore both default layers when skipDefault is true", () => {
      const result = mergeComponentData({
        defaultMountData: { a: 1 },
        defaultData: { b: 2 },
        mountData: { c: 3 },
        skipDefault: true,
      });

      expect(result).toEqual({ c: 3 });
    });

    it("should ignore only defaultMountData when skipOptions is true", () => {
      const result = mergeComponentData({
        defaultMountData: { a: 1 },
        defaultData: { b: 2 },
        skipOptions: true,
      });

      expect(result).toEqual({ b: 2 });
    });

    it("should keep defaultData active when skipOptions is true and merges with level 2", () => {
      const result = mergeComponentData({
        defaultMountData: { a: 1 },
        defaultData: { b: 2 },
        mountData: { c: 3 },
        directData: { d: 4 },
        skipOptions: true,
      });

      expect(result).toEqual({ b: 2, c: 3, d: 4 });
    });

    it("should prioritize skipDefault over skipOptions when both are true", () => {
      const result = mergeComponentData({
        defaultMountData: { a: 1 },
        defaultData: { b: 2 },
        mountData: { c: 3 },
        skipDefault: true,
        skipOptions: true,
      });

      expect(result).toEqual({ c: 3 });
    });
  });

  describe("special values", () => {
    it("should allow overriding with undefined and null", () => {
      const result = mergeComponentData({
        defaultData: { a: 1, b: 2 },
        directData: { a: undefined, b: null },
      });

      expect(result).toHaveProperty("a");
      expect(result.a).toBeUndefined();
      expect(result.b).toBeNull();
    });

    it("should handle missing arguments gracefully", () => {
      expect(mergeComponentData({})).toEqual({});
    });
  });

  describe("immutability", () => {
    it("should not mutate any input objects", () => {
      const defaultMountData: Data = { a: 1 };
      const defaultData: Data = { b: 2 };
      const mountData: Data = { c: 3 };
      const directData: Data = { d: 4 };

      const snapshot = {
        defaultMountData: { ...defaultMountData },
        defaultData: { ...defaultData },
        mountData: { ...mountData },
        directData: { ...directData },
      };

      mergeComponentData({
        defaultMountData,
        defaultData,
        mountData,
        directData,
      });

      expect(defaultMountData).toEqual(snapshot.defaultMountData);
      expect(defaultData).toEqual(snapshot.defaultData);
      expect(mountData).toEqual(snapshot.mountData);
      expect(directData).toEqual(snapshot.directData);
    });

    it("should return a new object, not a reference to any input", () => {
      const defaultData = { a: 1 };
      const result = mergeComponentData({ defaultData });

      expect(result).not.toBe(defaultData);
    });
  });
});
