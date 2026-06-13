import { afterEach, describe, expect, it, vi } from "vitest";
import { warnRootPluginOption } from "../warnRootPluginOption.js";

describe("warnRootPluginOption", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should suggest moving the option under plugins", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    warnRootPluginOption("i18n", "mountOptions");

    expect(warnSpy).toHaveBeenCalledTimes(1);

    const message = warnSpy.mock.calls[0][0];

    expect(message).toContain('Detected plugin option "i18n"');
    expect(message).toContain('"mountOptions"');
    expect(message).toContain("plugins: {");
    expect(message).toContain("i18n: { ... }");
    expect(message).toContain('Did you mean to use "mountOptions.plugins.i18n"?');
  });

  it.each([
    ["i18n", "mountOptions"],
    ["pinia", "defaultMountOptions"],
    ["router", "extraOptions"],
  ])(
    'should include plugin name "%s" and context "%s" in the warning message',
    (pluginName, context) => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      warnRootPluginOption(pluginName, context);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`"${pluginName}"`));

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`"${context}"`));

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(`${context}.plugins.${pluginName}`),
      );
    },
  );

  it.each(["defaultMountOptions", "mountOptions", "extraOptions"])(
    'should include "%s" in the suggested path',
    (context) => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      warnRootPluginOption("i18n", context);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`"${context}.plugins.i18n"`));
    },
  );
});
