import { describe, it, expect } from "vitest";

import { i18nPlugin } from "../i18nPlugin.js";
import { createI18nPlugin } from "../createI18nPlugin.js";

describe("i18nPlugin", () => {
  it("should expose plugin name", () => {
    expect(i18nPlugin.getName()).toBe("i18n");
  });

  it("should expose plugin definition", () => {
    const definition = i18nPlugin.getDefinition();

    expect(definition.create).toBe(createI18nPlugin);
  });

  it("should provide default Vue I18n options", () => {
    const options = i18nPlugin.getDefaultOptions()();

    expect(options).toEqual({
      legacy: false,
      globalInjection: true,
    });
  });

  it("should create functional Vue I18n instance using default options", () => {
    const options = i18nPlugin.getDefaultOptions()();

    const definition = i18nPlugin.getDefinition();
    const i18n = definition.create(options);

    expect(i18n.install).toBeTypeOf("function");
    expect(i18n.global.t).toBeTypeOf("function");
  });
});
