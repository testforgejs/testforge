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

/**
 * @param {MountContext} ctx
 * @returns {PipelineMiddleware[]}
 */
export const createMountPipeline = (ctx) => [
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
