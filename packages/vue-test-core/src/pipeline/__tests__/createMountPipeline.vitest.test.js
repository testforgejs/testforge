import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../middleware/plugins/createPluginsMiddlewares.js", () => ({
  createPluginsMiddlewares: vi.fn(() => ["plugin-mw-1", "plugin-mw-2"]),
}));

vi.mock("../middleware/plugins/createPluginsMergeMiddlewares.js", () => ({
  createPluginsMergeMiddlewares: vi.fn(() => ["merge-mw-1"]),
}));

import {
  assertConfigurationShape,
  assertResultShape,
  assertPluginOptions,
} from "../middleware/validation";

import {
  withPreset,
  withPluginsManifest,
  withBaseMountOptions,
  withGlobal,
  withPluginsBase,
} from "../middleware/transformers";

import { createPluginsMiddlewares } from "../middleware/plugins/createPluginsMiddlewares.js";
import { createPluginsMergeMiddlewares } from "../middleware/plugins/createPluginsMergeMiddlewares.js";
import { createMountPipeline } from "../createMountPipeline.js";

describe("createMountPipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create middleware pipeline in correct order", () => {
    const ctx = {
      supportedPlugins: { pinia: {}, i18n: {} },
    };

    const pipeline = createMountPipeline(ctx);

    expect(pipeline).toEqual([
      assertConfigurationShape,
      assertResultShape,
      withPreset,
      withPluginsManifest,
      withBaseMountOptions,
      withGlobal,
      withPluginsBase,
      assertPluginOptions,
      "plugin-mw-1",
      "plugin-mw-2",
      "merge-mw-1",
      assertResultShape,
    ]);
  });

  it("should pass supportedPlugins into plugin factories", () => {
    const ctx = {
      supportedPlugins: { pinia: {}, i18n: {} },
    };

    createMountPipeline(ctx);

    expect(createPluginsMiddlewares).toHaveBeenCalledWith(ctx.supportedPlugins);

    expect(createPluginsMergeMiddlewares).toHaveBeenCalledWith(
      ctx.supportedPlugins,
    );
  });
});
