import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock before import
vi.mock("../../../plugins/adapters/createPluginMergeMiddleware.js", () => ({
  createPluginMergeMiddleware: vi.fn((name) => `mw:${name}`),
}));

import { createPluginMergeMiddleware } from "../../adapters/createPluginMergeMiddleware.js";
import { createPluginsMergeMiddlewares } from "../createPluginsMergeMiddlewares.js";

describe("createPluginsMergeMiddlewares", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create middleware for each supported plugin", () => {
    const supportedPlugins = {
      pinia: {},
      i18n: {},
      router: {},
    };

    const result = createPluginsMergeMiddlewares(supportedPlugins);

    expect(createPluginMergeMiddleware).toHaveBeenCalledTimes(3);
    expect(createPluginMergeMiddleware).toHaveBeenCalledWith("pinia");
    expect(createPluginMergeMiddleware).toHaveBeenCalledWith("i18n");
    expect(createPluginMergeMiddleware).toHaveBeenCalledWith("router");

    expect(result).toEqual(["mw:pinia", "mw:i18n", "mw:router"]);
  });

  it("should return empty array when no plugins provided", () => {
    const result = createPluginsMergeMiddlewares({});

    expect(result).toEqual([]);
    expect(createPluginMergeMiddleware).not.toHaveBeenCalled();
  });

  it("should preserve order of Object.keys iteration", () => {
    const supportedPlugins = {
      first: {},
      second: {},
      third: {},
    };

    createPluginsMergeMiddlewares(supportedPlugins);

    expect(createPluginMergeMiddleware.mock.calls.map((c) => c[0])).toEqual([
      "first",
      "second",
      "third",
    ]);
  });
});
