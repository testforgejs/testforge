import type { PipelineMiddleware, RuntimeContext } from "../../../types.js";

import { resolveExtraOptions } from "../../plugins/logic/resolveExtraOptions";

import { assertUnsupportedPlugins } from "./validators/assertUnsupportedPlugins";
import { assertExtraOptionUnsupportedPlugins } from "./validators/assertExtraOptionUnsupportedPlugins";
import { assertResolvedPluginValues } from "./validators/assertResolvedPluginValues";
import { assertExtraOptionPluginValues } from "./validators/assertExtraOptionPluginValues";
import { assertNoDefaultInstanceCapture } from "./validators/assertNoDefaultInstanceCapture";

/*
 * Validates plugin configuration layers used by the pipeline.
 *
 * Ensures that:
 * - instance capturing is not configured in factory-level defaults
 * - only plugins supported by the active preset are configured
 * - plugin runtime values have valid shape
 * - extra option overlays are runtime-safe
 *
 * After successful validation, plugin-related context types
 * can be treated as narrowed and runtime-safe.
 */
export const assertPluginOptions: PipelineMiddleware<RuntimeContext, RuntimeContext> = (
  ctx,
): RuntimeContext => {
  const { defaultMountOptions, supportedPlugins, extraOptions } = ctx;
  const { plugins } = ctx.result;

  const supported = new Set(Object.keys(supportedPlugins));

  assertNoDefaultInstanceCapture(defaultMountOptions);

  assertUnsupportedPlugins(plugins || {}, supported);

  assertExtraOptionUnsupportedPlugins(resolveExtraOptions(extraOptions), supported);

  assertResolvedPluginValues(plugins);

  assertExtraOptionPluginValues(resolveExtraOptions(extraOptions), supported);

  return ctx as RuntimeContext;
};
