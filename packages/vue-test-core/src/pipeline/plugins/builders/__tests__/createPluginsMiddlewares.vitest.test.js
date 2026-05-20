import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPluginsMiddlewares } from "../createPluginsMiddlewares.js";
import { createPluginMiddleware } from "../../adapters/createPluginMiddleware.js";

vi.mock("../../../plugins/adapters/createPluginMiddleware.js");

describe("createPluginsMiddlewares", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when no supported plugins provided", () => {
    const result = createPluginsMiddlewares({});

    expect(result).toEqual([]);
    expect(createPluginMiddleware).not.toHaveBeenCalled();
  });

  it("creates middleware for each supported plugin", () => {
    createPluginMiddleware
      .mockReturnValueOnce("mw1")
      .mockReturnValueOnce("mw2")
      .mockReturnValueOnce("mw3");

    const supportedPlugins = {
      pinia: {},
      i18n: {},
      router: {},
    };

    const result = createPluginsMiddlewares(supportedPlugins);

    expect(createPluginMiddleware).toHaveBeenCalledTimes(3);
    expect(createPluginMiddleware).toHaveBeenNthCalledWith(1, "pinia");
    expect(createPluginMiddleware).toHaveBeenNthCalledWith(2, "i18n");
    expect(createPluginMiddleware).toHaveBeenNthCalledWith(3, "router");

    expect(result).toEqual(["mw1", "mw2", "mw3"]);
  });

  it("preserves the order of Object.keys iteration", () => {
    createPluginMiddleware.mockReturnValueOnce("first").mockReturnValueOnce("second");

    const supportedPlugins = {
      a: {},
      b: {},
    };

    const result = createPluginsMiddlewares(supportedPlugins);

    expect(result).toEqual(["first", "second"]);
  });
});
