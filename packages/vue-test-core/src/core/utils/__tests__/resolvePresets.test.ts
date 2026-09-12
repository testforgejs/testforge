import { describe, expect, it } from "vitest";

import type { PresetDefinition } from "../../../types";
import { resolvePresets } from "../resolvePresets.js";

describe("resolvePresets", () => {
  const preset: PresetDefinition = {
    manifest: [],
    defaults: {},
  };

  it("should wrap a single preset as the default preset", () => {
    const result = resolvePresets({
      preset,
    });

    expect(result).toEqual({
      default: preset,
    });
  });

  it("should return the preset collection unchanged", () => {
    const presets = {
      default: preset,
      integration: preset,
    };

    const result = resolvePresets({
      presets,
    });

    expect(result).toBe(presets);
  });

  it("should return an empty collection when no presets are provided", () => {
    const result = resolvePresets({});

    expect(result).toEqual({});
  });
});
