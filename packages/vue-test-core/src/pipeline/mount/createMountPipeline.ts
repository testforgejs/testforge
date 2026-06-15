import type { PipelineContext } from "../../types";

import {
  assertConfigurationShape,
  assertResultShape,
  assertFinalResultShape,
  assertPluginOptions,
} from "../middleware/validation";
import {
  withPreset,
  withPluginsManifest,
  withBaseMountOptions,
  withGlobal,
  withAttrs,
  withPluginsBase,
} from "../middleware/transformers";
import { createPluginsMiddlewares } from "../plugins/builders/createPluginsMiddlewares.js";
import { createPluginsMergeMiddlewares } from "../plugins/builders/createPluginsMergeMiddlewares.js";

/**
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
 *
 * @param ctx - The initial pipeline context object.
 * @returns A strictly typed read-only tuple of pipeline middleware preserving end-to-end type flow.
 */
export function createMountPipeline(ctx: PipelineContext) {
  return [
    assertConfigurationShape,
    assertResultShape,
    withPreset,
    withPluginsManifest,
    withBaseMountOptions,
    withGlobal,
    withAttrs,
    withPluginsBase,
    assertPluginOptions,
    ...createPluginsMiddlewares(ctx.supportedPlugins),
    ...createPluginsMergeMiddlewares(ctx.supportedPlugins),
    assertFinalResultShape,
  ] as const;
}
