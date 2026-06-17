import type {
  PipelineMiddleware,
  RuntimeContext,
  SupportedPluginsMap,
  PluginName,
} from "../../../types";

import { createPluginMergeMiddleware } from "../../plugins/adapters/createPluginMergeMiddleware.js";

/*
 * Creates middleware that merges plugin presets into plugin configurations.
 *
 * At this stage, each plugin receives its preset values as a base layer,
 * while preserving any configuration already present in `ctx.result.plugins`.
 */
export function createPluginsMergeMiddlewares(
  supportedPlugins: SupportedPluginsMap,
): PipelineMiddleware<RuntimeContext, RuntimeContext>[] {
  return Object.keys(supportedPlugins).map((name) =>
    createPluginMergeMiddleware(name as PluginName),
  );
}
