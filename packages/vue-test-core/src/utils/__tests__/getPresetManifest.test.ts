import { describe, expect, it } from "vitest";

import { getPresetManifest } from "../getPresetManifest.js";

describe("getPresetManifest", () => {
  describe("when a preset is provided", () => {
    it("should return the manifest declared by the preset", () => {
      const manifest = [
        {
          module: {
            getName: () => "i18n",
            getDefinition: () => ({
              create: () => ({}),
            }),
          },
          enabled: true,
        },
        {
          module: {
            getName: () => "pinia",
            getDefinition: () => ({
              create: () => ({}),
            }),
          },
          enabled: false,
        },
      ];

      const preset = {
        manifest,
        defaults: {},
      };

      expect(getPresetManifest(preset)).toBe(manifest);
    });
  });

  describe("when preset is undefined", () => {
    it("should return an empty array", () => {
      expect(getPresetManifest(undefined)).toEqual([]);
    });
  });

  describe("when the preset contains an empty manifest", () => {
    it("should return an empty array", () => {
      const preset = {
        manifest: [],
        defaults: {},
      };

      expect(getPresetManifest(preset)).toEqual([]);
    });
  });

  describe("returned value identity", () => {
    it("should return the original manifest array", () => {
      const manifest = [
        {
          module: {
            getName: () => "router",
            getDefinition: () => ({
              create: () => ({}),
            }),
          },
          enabled: true,
        },
      ];

      const preset = {
        manifest,
        defaults: {},
      };

      expect(getPresetManifest(preset)).toBe(manifest);
    });
  });
});
