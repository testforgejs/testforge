import { mergePluginPresets } from "./mergePluginPresets.js";

export function createPluginMergeMiddleware(name) {
  /** @type {PipelineMiddleware} */
  return (ctx) => {
    return mergePluginPresets(ctx, name);
  };
}
