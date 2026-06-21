import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockCtx } from "../../../__tests__/fixtures.js";

vi.mock("../../logic/mergePluginDefaults.js", () => ({
  mergePluginDefaults: vi.fn((ctx) => ctx),
}));

import { mergePluginDefaults } from "../../logic/mergePluginDefaults.js";
import { createPluginMergeMiddleware } from "../createPluginMergeMiddleware.js";

import type { RuntimeContext } from "../../../../types";

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
    const ctx = createMockCtx<RuntimeContext>({ mountOptions: { attrs: { some: "context" } } });
    middleware(ctx);

    expect(mergePluginDefaults).toHaveBeenCalledTimes(1);
    expect(mergePluginDefaults).toHaveBeenCalledWith(ctx, "i18n");
  });

  it("should return the value returned by mergePluginDefaults", () => {
    const middleware = createPluginMergeMiddleware("router");
    const ctx = createMockCtx<RuntimeContext>({ mountOptions: { attrs: { some: "context" } } });

    const result = middleware(ctx);

    expect(result).toBe(ctx);
  });
});
