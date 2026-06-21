import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock before import
vi.mock("../../../plugins/adapters/createPluginMergeMiddleware.js", () => ({
  createPluginMergeMiddleware: vi.fn((name) => `mw:${name}`),
}));

import { createPluginMergeMiddleware } from "../../adapters/createPluginMergeMiddleware.js";
import { createPluginsMergeMiddlewares } from "../createPluginsMergeMiddlewares.js";

const mockCreatePluginMergeMiddleware = vi.mocked(createPluginMergeMiddleware);

describe("createPluginsMergeMiddlewares", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create middleware for each supported plugin", () => {
    const supportedPlugins = {
      pinia: true,
      i18n: true,
      router: true,
    };

    const result = createPluginsMergeMiddlewares(supportedPlugins);

    expect(mockCreatePluginMergeMiddleware).toHaveBeenCalledTimes(3);
    expect(mockCreatePluginMergeMiddleware).toHaveBeenCalledWith("pinia");
    expect(mockCreatePluginMergeMiddleware).toHaveBeenCalledWith("i18n");
    expect(mockCreatePluginMergeMiddleware).toHaveBeenCalledWith("router");

    expect(result).toEqual(["mw:pinia", "mw:i18n", "mw:router"]);
  });

  it("should return empty array when no plugins provided", () => {
    const result = createPluginsMergeMiddlewares({});

    expect(result).toEqual([]);
    expect(mockCreatePluginMergeMiddleware).not.toHaveBeenCalled();
  });

  it("should preserve order of Object.keys iteration", () => {
    const supportedPlugins = {
      first: true,
      second: true,
      third: true,
    };

    createPluginsMergeMiddlewares(supportedPlugins);

    expect(mockCreatePluginMergeMiddleware.mock.calls.map((c) => c[0])).toEqual([
      "first",
      "second",
      "third",
    ]);
  });
});
