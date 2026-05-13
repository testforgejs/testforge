import { describe, it, expect, vi } from "vitest";
import { createSupportedPluginsState } from "../createSupportedPluginsState.js";

describe("createSupportedPluginsState", () => {
  it("should return empty object when preset or manifest is missing", () => {
    expect(createSupportedPluginsState({})).toEqual({});
    expect(createSupportedPluginsState(null)).toEqual({});
    expect(createSupportedPluginsState(undefined)).toEqual({});
  });

  it("should map enabled plugins to empty objects and disabled to false", () => {
    const mockPinia = { getName: vi.fn(() => "pinia") };
    const mockI18n = { getName: vi.fn(() => "i18n") };

    const preset = {
      manifest: [
        { module: mockPinia, enabled: true },
        { module: mockI18n, enabled: false },
      ],
    };

    const result = createSupportedPluginsState(preset);

    expect(result).toEqual({
      pinia: {},
      i18n: false,
    });
  });

  it("should call getName for each manifest entry", () => {
    const getNameA = vi.fn(() => "a");
    const getNameB = vi.fn(() => "b");

    const preset = {
      manifest: [
        { module: { getName: getNameA }, enabled: true },
        { module: { getName: getNameB }, enabled: true },
      ],
    };

    createSupportedPluginsState(preset);

    expect(getNameA).toHaveBeenCalledTimes(1);
    expect(getNameB).toHaveBeenCalledTimes(1);
  });

  it("should return empty object when manifest is empty", () => {
    const preset = { manifest: [] };
    expect(createSupportedPluginsState(preset)).toEqual({});
  });
});
