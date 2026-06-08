import { describe, it, expect } from "vitest";

import { i18nPlugin } from "../i18nPlugin";
import { createI18nPlugin } from "../createI18nPlugin";

describe("i18nPlugin", () => {
  it("should expose plugin name", () => {
    expect(i18nPlugin.getName()).toBe("i18n");
  });

  it("should expose plugin definition", () => {
    const definition = i18nPlugin.getDefinition();

    expect(definition.create).toBe(createI18nPlugin);
  });
});
