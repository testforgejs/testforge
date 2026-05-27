import { describe, it, expect, vi, beforeEach } from "vitest";

// Important: mock before importing the module under test
vi.mock("../../logic/mergePluginDefaults.js", () => ({
  mergePluginDefaults: vi.fn((ctx) => ctx),
}));

import { mergePluginDefaults } from "../../logic/mergePluginDefaults.js";
import { createPluginMergeMiddleware } from "../createPluginMergeMiddleware.js";

describe("createPluginMergeMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a function (middleware)", () => {
    const middleware = createPluginMergeMiddleware("pinia");
    expect(typeof middleware).toBe("function");
  });

  it("should call mergePluginDefaults with correct ctx and plugin name", () => {
    const middleware = createPluginMergeMiddleware("i18n");
    const ctx = { some: "context" };

    middleware(ctx);

    expect(mergePluginDefaults).toHaveBeenCalledTimes(1);
    expect(mergePluginDefaults).toHaveBeenCalledWith(ctx, "i18n");
  });

  it("should return the value returned by mergePluginDefaults", () => {
    const middleware = createPluginMergeMiddleware("router");
    const ctx = { foo: "bar" };

    const result = middleware(ctx);

    expect(result).toBe(ctx);
  });
});
