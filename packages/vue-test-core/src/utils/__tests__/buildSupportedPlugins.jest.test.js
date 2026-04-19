import { buildSupportedPlugins } from "../buildSupportedPlugins.js";

describe("buildSupportedPlugins", () => {
  const mockPinia = { getName: () => "pinia" };
  const mockI18n = { getName: () => "i18n" };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("should correctly map enabled plugins to empty objects", () => {
    const preset = {
      manifest: [
        { module: mockPinia, enabled: true },
        { module: mockI18n, enabled: true },
      ],
    };

    const result = buildSupportedPlugins(preset);

    expect(result).toEqual({
      pinia: {},
      i18n: {},
    });
  });

  it("should map disabled plugins to false", () => {
    const preset = {
      manifest: [
        { module: mockPinia, enabled: true },
        { module: mockI18n, enabled: false }, // Turned off
      ],
    };

    const result = buildSupportedPlugins(preset);

    expect(result).toEqual({
      pinia: {},
      i18n: false, // Should be false
    });
  });

  it("should return empty object when manifest is an empty array", () => {
    const preset = { manifest: [] };
    const result = buildSupportedPlugins(preset);
    expect(result).toEqual({});
  });

  it("should handle an empty object, null or undefined preset gracefully", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(buildSupportedPlugins({})).toEqual({});
    expect(buildSupportedPlugins(null)).toEqual({});
    expect(buildSupportedPlugins(undefined)).toEqual({});
    consoleSpy.mockRestore();
  });
});
