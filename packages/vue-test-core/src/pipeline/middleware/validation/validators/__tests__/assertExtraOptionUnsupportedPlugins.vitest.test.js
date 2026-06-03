import { assertExtraOptionUnsupportedPlugins } from "../assertExtraOptionUnsupportedPlugins";

describe("assertExtraOptionUnsupportedPlugins", () => {
  it("should not throw when all plugins are supported", () => {
    expect(() => {
      assertExtraOptionUnsupportedPlugins(
        {
          plugins: {
            i18n: {},
            pinia: {},
          },
        },
        new Set(["i18n", "pinia", "router"]),
      );
    }).not.toThrow();
  });

  it("should not throw when plugins are not provided", () => {
    expect(() => {
      assertExtraOptionUnsupportedPlugins({}, new Set(["i18n", "pinia"]));
    }).not.toThrow();
  });

  it("should not throw when plugins object is empty", () => {
    expect(() => {
      assertExtraOptionUnsupportedPlugins(
        {
          plugins: {},
        },
        new Set(["i18n", "pinia"]),
      );
    }).not.toThrow();
  });

  it("should throw when unsupported plugin is configured", () => {
    expect(() => {
      assertExtraOptionUnsupportedPlugins(
        {
          plugins: {
            vuetify: {},
          },
        },
        new Set(["i18n", "pinia"]),
      );
    }).toThrow('Plugin "vuetify" is configured but not supported by the active preset.');
  });
});
