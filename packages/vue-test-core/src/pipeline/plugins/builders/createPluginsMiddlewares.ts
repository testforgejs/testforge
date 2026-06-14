import type {
  PipelineMiddleware,
  PluginOptionsReadyContext,
  PluginName,
  SupportedPluginsMap,
} from "../../../types";

import { createPluginMiddleware } from "../../plugins/adapters/createPluginMiddleware.js";

/*
 * Creates plugin middleware instances for all supported plugins.
 *
 * Each plugin name is mapped to its corresponding middleware factory.
 * The resulting middleware list is later injected into the pipeline.
 */
export function createPluginsMiddlewares(
  supportedPlugins: SupportedPluginsMap,
): PipelineMiddleware<PluginOptionsReadyContext, PluginOptionsReadyContext>[] {
  return (Object.keys(supportedPlugins) as PluginName[]).map((name) =>
    createPluginMiddleware(name),
  );
}
