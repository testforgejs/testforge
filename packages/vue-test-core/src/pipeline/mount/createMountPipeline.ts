import type { PipelineContext, PipelineMiddleware } from "../../types";

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
import { createPluginsMiddlewares } from "../plugins/builders/createPluginsMiddlewares.js";
import { createPluginsMergeMiddlewares } from "../plugins/builders/createPluginsMergeMiddlewares.js";

/*
 * Creates the mount processing pipeline.
 *
 * Pipeline stages:
 * - validate input context
 * - initialize preset and plugin state
 * - resolve mount configuration
 * - resolve plugin runtime configuration
 * - validate the final runtime result
 *
 * Middleware order is significant.
 */
export function createMountPipeline(ctx: PipelineContext): PipelineMiddleware[] {
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
