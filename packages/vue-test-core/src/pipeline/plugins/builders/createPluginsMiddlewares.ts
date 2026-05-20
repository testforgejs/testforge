import type { PipelineMiddleware, PluginName, SupportedPluginsMap } from "../../../types";

import { createPluginMiddleware } from "../../plugins/adapters/createPluginMiddleware.js";

/**
 * @param {SupportedPluginsMap} supportedPlugins
 * @returns {PipelineMiddleware[]}
 */
export function createPluginsMiddlewares(
  supportedPlugins: SupportedPluginsMap,
): PipelineMiddleware[] {
  return (Object.keys(supportedPlugins) as PluginName[]).map((name) =>
    createPluginMiddleware(name),
  );
}
