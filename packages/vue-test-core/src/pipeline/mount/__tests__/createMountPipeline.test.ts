import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockCtx } from "../../__tests__/fixtures.js";

vi.mock("../../plugins/builders/createPluginsMiddlewares.js", () => ({
  createPluginsMiddlewares: vi.fn(() => ["plugin-mw-1", "plugin-mw-2"]),
}));

vi.mock("../../plugins/builders/createPluginsMergeMiddlewares.js", () => ({
  createPluginsMergeMiddlewares: vi.fn(() => ["merge-mw-1"]),
}));

import {
  assertConfigurationShape,
  assertResultShape,
  assertFinalResultShape,
  assertPluginOptions,
} from "../../middleware/validation";

import {
  withPreset,
  withPluginsManifest,
  withBaseMountOptions,
  withGlobal,
  withAttrs,
  withPluginsBase,
} from "../../middleware/transformers";

import { createPluginsMiddlewares } from "../../plugins/builders/createPluginsMiddlewares.js";
import { createPluginsMergeMiddlewares } from "../../plugins/builders/createPluginsMergeMiddlewares.js";
import { createMountPipeline } from "../createMountPipeline";

describe("createMountPipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create middleware pipeline in correct order", () => {
    const ctx = createMockCtx({
      supportedPlugins: { pinia: true, i18n: true },
    });
    const pipeline = createMountPipeline(ctx);

    expect(pipeline).toEqual([
      assertConfigurationShape,
      assertResultShape,
      withPreset,
      withPluginsManifest,
      withBaseMountOptions,
      withGlobal,
      withAttrs,
      withPluginsBase,
      assertPluginOptions,
      "plugin-mw-1",
      "plugin-mw-2",
      "merge-mw-1",
      assertFinalResultShape,
    ]);
  });

  it("should pass supportedPlugins into plugin factories", () => {
    const ctx = createMockCtx({
      supportedPlugins: { pinia: true, i18n: true },
    });

    createMountPipeline(ctx);

    expect(createPluginsMiddlewares).toHaveBeenCalledWith(ctx.supportedPlugins);

    expect(createPluginsMergeMiddlewares).toHaveBeenCalledWith(ctx.supportedPlugins);
  });
});
