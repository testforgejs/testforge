import { mergeComponentData } from "../mergeComponentData.js";

describe("mergeComponentData", () => {
  const L1_MOUNT = { keyA: 100, keyC: 300, shared: "mount-l1" };
  const L1_DIRECT = { keyB: 200, shared: "direct-l1" };

  const L2_MOUNT = { keyC: 301, keyD: 400, shared: "mount-l2" };
  const L2_DIRECT = { keyB: 201, keyE: 500, shared: "direct-l2" };

  describe("when all layers are provided without flags", () => {
    it("should respect correct priority order: L2 direct > L2 mount > L1 direct > L1 mount", () => {
      const result = mergeComponentData({
        defaultMountData: L1_MOUNT,
        defaultData: L1_DIRECT,
        mountData: L2_MOUNT,
        directData: L2_DIRECT,
      });

      expect(result).toEqual({
        keyA: 100, // L1 mount (not overlaid above)
        keyB: 201, // L2 direct > L1 direct
        keyC: 301, // L2 mount > L1 mount
        keyD: 400, // L2 mount only
        keyE: 500, // L2 direct only
        shared: "direct-l2", // the highest priority
      });
    });
  });

  describe("when skipDefault is true", () => {
    it("should ignore both L1 mount and L1 direct completely", () => {
      const result = mergeComponentData({
        defaultMountData: L1_MOUNT,
        defaultData: L1_DIRECT,
        mountData: L2_MOUNT,
        directData: L2_DIRECT,
        skipDefault: true,
      });

      expect(result).toEqual({
        keyC: 301,
        keyD: 400,
        keyB: 201,
        keyE: 500,
        shared: "direct-l2",
      });

      expect(result.a).toBeUndefined();
      expect(result.shared).not.toBe("mount-l1");
      expect(result.shared).not.toBe("direct-l1");
    });

    it("should return an empty object when L2 is empty", () => {
      const result = mergeComponentData({
        defaultMountData: L1_MOUNT,
        defaultData: L1_DIRECT,
        mountData: {},
        directData: {},
        skipDefault: true,
      });

      expect(result).toEqual({});
    });
  });

  describe("when skipOptions is true (disables only defaultMountData)", () => {
    it("should exclude L1 mount but preserve L1 direct in the final merge", () => {
      const result = mergeComponentData({
        defaultMountData: L1_MOUNT,
        defaultData: L1_DIRECT,
        mountData: L2_MOUNT,
        directData: L2_DIRECT,
        skipOptions: true,
      });

      expect(result).toEqual({
        keyA: undefined, // was only in L1 mount → skipped
        keyB: 201, // L2 direct > L1 direct
        keyC: 301, // L2 mount
        keyD: 400,
        keyE: 500,
        shared: "direct-l2",
      });

      expect(result.a).toBeUndefined();
    });

    it("should prioritize L2 mount over L1 direct when L2 direct is missing", () => {
      const result = mergeComponentData({
        defaultMountData: { keyX: 10 },
        defaultData: { keyY: 20, keyZ: 30 }, // L1 direct
        mountData: { keyZ: 300 }, // L2 mount
        directData: {},
        skipOptions: true,
      });

      expect(result).toEqual({
        keyY: 20,
        keyZ: 300, // L2 mount takes precedence over L1 direct
      });
    });
  });

  describe("when merging data within the same level", () => {
    describe("at Level 1 (defaults)", () => {
      it("should prioritize directData over mountData", () => {
        const result = mergeComponentData({
          defaultMountData: { keyA: "mount", conflict: "L1-mount" },
          defaultData: { keyA: "direct", conflict: "L1-direct" },
        });

        expect(result).toEqual({
          keyA: "direct",
          conflict: "L1-direct",
        });
      });
    });

    describe("at Level 2", () => {
      it("should prioritize directData over mountData", () => {
        const result = mergeComponentData({
          mountData: { keyA: "mount", conflict: "L2-mount" },
          directData: { keyA: "direct", conflict: "L2-direct" },
        });

        expect(result).toEqual({
          keyA: "direct",
          conflict: "L2-direct",
        });
      });
    });
  });

  describe("when handling empty or missing arguments", () => {
    it("should return an empty object when no data is provided", () => {
      const result = mergeComponentData({});
      expect(result).toEqual({});
    });

    it("should ignore undefined and null values while preserving valid data", () => {
      const result = mergeComponentData({
        defaultMountData: undefined,
        defaultData: null,
        mountData: { real: 123 },
        directData: undefined,
      });

      expect(result).toEqual({ real: 123 });
    });
  });

  describe("when properties are explicitly set to null or undefined", () => {
    it("should allow overriding base values with undefined", () => {
      const result = mergeComponentData({
        defaultData: { status: "active" },
        directData: { status: undefined },
      });

      // Verify the presence of the key and its value
      expect(result).toHaveProperty("status");
      expect(result.status).toBeUndefined();
    });

    it("should allow overriding base values with null", () => {
      const result = mergeComponentData({
        defaultData: { user: { name: "John" } },
        directData: { user: null },
      });

      expect(result).toHaveProperty("user");
      expect(result.user).toBeNull();
    });

    it("should maintain the priority hierarchy even when values are falsy", () => {
      const result = mergeComponentData({
        defaultMountData: { show: true },
        defaultData: { show: false }, // Wins at Level 1
        mountData: { show: null }, // Should win at Level 2
      });

      expect(result.show).toBeNull();
    });
  });

  describe("when some layers are missing or empty", () => {
    it("should merge only the provided layers gracefully", () => {
      const result = mergeComponentData({
        defaultData: { keyA: 1 },
        directData: { keyB: 2 },
      });

      expect(result).toEqual({ keyA: 1, keyB: 2 });
    });
  });

  describe("when resolving conflicts within the same level", () => {
    it("should prioritize direct data over mount data at Level 2 (instance)", () => {
      const result = mergeComponentData({
        mountData: { key: "mount" },
        directData: { key: "direct" },
      });

      expect(result.key).toBe("direct");
    });

    it("should prioritize direct data over mount data at Level 1 (defaults)", () => {
      const result = mergeComponentData({
        defaultMountData: { key: "mount-base" },
        defaultData: { key: "direct-base" },
      });

      expect(result.key).toBe("direct-base");
    });
  });

  describe("under realistic usage scenarios", () => {
    it("should allow complete override of all default values when specific values are provided", () => {
      const result = mergeComponentData({
        defaultMountData: { size: "md", variant: "primary" },
        defaultData: { disabled: false, loading: false },
        mountData: { variant: "danger" },
        directData: { disabled: true, custom: "extra" },
        skipDefault: false,
        skipOptions: false,
      });

      expect(result).toEqual({
        size: "md",
        variant: "danger", // mountOptions.props
        disabled: true, // direct props
        loading: false,
        custom: "extra",
      });
    });

    it('should provide a "clean slate" by excluding all level 1 data when skipDefault is enabled', () => {
      const result = mergeComponentData({
        defaultMountData: { size: "md" },
        defaultData: { disabled: false },
        mountData: { variant: "warning" },
        directData: { text: "Click me" },
        skipDefault: true,
      });

      expect(result).toEqual({
        variant: "warning",
        text: "Click me",
      });
    });
  });
});
