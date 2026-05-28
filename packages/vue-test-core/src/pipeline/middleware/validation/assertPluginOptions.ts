import type {
  PipelineMiddleware,
  PipelineContext,
  PluginOptionsReadyContext,
} from "../../../types";

import { resolveExtraOptions } from "../../plugins/logic/resolveExtraOptions";

import { assertUnsupportedPlugins } from "./validators/assertUnsupportedPlugins";
import { assertResolvedPluginValues } from "./validators/assertResolvedPluginValues";
import { assertExtraOptionPluginValues } from "./validators/assertExtraOptionPluginValues";

/*
 * Validates plugin configuration layers used by the pipeline.
 *
 * Ensures that:
 * - only plugins supported by the active preset are configured
 * - plugin runtime values have valid shape
 * - extra option overlays are runtime-safe
 *
 * After successful validation, plugin-related context types
 * can be treated as narrowed and runtime-safe.
 */
export const assertPluginOptions: PipelineMiddleware<PipelineContext, PluginOptionsReadyContext> = (
  ctx,
) => {
  const { supportedPlugins, extraOptions } = ctx;
  const { plugins } = ctx.result;

  const supported = new Set(Object.keys(supportedPlugins));

  assertUnsupportedPlugins(plugins || {}, supported);

  assertResolvedPluginValues(plugins);

  assertExtraOptionPluginValues(resolveExtraOptions(extraOptions), supported);

  return ctx as PluginOptionsReadyContext;
};
