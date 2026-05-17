import type { MountContext, PipelineMiddleware } from "../types";

import {
  assertConfigurationShape,
  assertResultShape,
  assertPluginOptions,
} from "./middleware/validation";
import {
  withPreset,
  withPluginsManifest,
  withBaseMountOptions,
  withGlobal,
  withPluginsBase,
} from "./middleware/transformers";
import { createPluginsMiddlewares } from "./middleware/plugins/createPluginsMiddlewares.js";
import { createPluginsMergeMiddlewares } from "./middleware/plugins/createPluginsMergeMiddlewares.js";

/*
Creates array of middleware for processing mount context.
Defines the full pipeline for preparing mount options and plugins.
*/
export function createMountPipeline(ctx: MountContext): PipelineMiddleware[] {
  return [
    assertConfigurationShape,
    assertResultShape,
    withPreset,
    withPluginsManifest,
    withBaseMountOptions,
    withGlobal,
    withPluginsBase,
    assertPluginOptions,
    ...createPluginsMiddlewares(ctx.supportedPlugins),
    ...createPluginsMergeMiddlewares(ctx.supportedPlugins),
    assertResultShape,
  ];
}
