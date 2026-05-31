import { describe, it, expect } from "vitest";

import { assertExtraOptionPluginValues } from "../assertExtraOptionPluginValues.js";

describe("assertExtraOptionPluginValues", () => {
  it("should NOT throw for valid plugin objects in extraOptions", () => {
    const extraOptions = {
      plugins: {
        pinia: {},
        i18n: {
          locale: "en",
        },
      },
    };

    const supported = new Set(["pinia", "i18n"]);

    expect(() => {
      assertExtraOptionPluginValues(extraOptions, supported);
    }).not.toThrow();
  });

  it("should NOT throw for plugins configured as false", () => {
    const extraOptions = {
      plugins: {
        pinia: false,
        router: false,
      },
    };

    const supported = new Set(["pinia", "router"]);

    expect(() => {
      assertExtraOptionPluginValues(extraOptions, supported);
    }).not.toThrow();
  });

  const invalidValues = [null, [], true, 123, "invalid"];

  it.each(invalidValues)("should throw for invalid plugin value in extraOptions: %p", (value) => {
    const extraOptions = {
      plugins: {
        pinia: value,
      },
    };

    const supported = new Set(["pinia"]);

    expect(() => {
      assertExtraOptionPluginValues(extraOptions, supported);
    }).toThrow('Invalid configuration for plugin "pinia" in extraOptions');
  });

  it("should ignore unknown extraOptions keys", () => {
    const extraOptions = {
      skipDefaultProps: true,
      skipDefaultSlots: false,
      //someTechnicalFlag: 123,
      //anotherKey: true,
    };

    const supported = new Set(["pinia", "i18n"]);

    expect(() => {
      assertExtraOptionPluginValues(extraOptions, supported);
    }).not.toThrow();
  });

  it("should validate only supported plugin keys", () => {
    const extraOptions = {
      plugins: {
        pinia: {},
        vuetify: 123,
      },
    };

    const supported = new Set(["pinia"]);

    expect(() => {
      assertExtraOptionPluginValues(extraOptions, supported);
    }).not.toThrow();
  });

  it("should NOT throw for empty extraOptions", () => {
    const extraOptions = {};

    const supported = new Set(["pinia", "i18n"]);

    expect(() => {
      assertExtraOptionPluginValues(extraOptions, supported);
    }).not.toThrow();
  });

  it("should include plugin name in error message", () => {
    const extraOptions = {
      plugins: {
        i18n: 123,
      },
    };

    const supported = new Set(["i18n"]);

    expect(() => {
      assertExtraOptionPluginValues(extraOptions, supported);
    }).toThrow(/i18n/);
  });
});
