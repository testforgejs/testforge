import type {
  PipelineMiddleware,
  PipelineContext,
  PluginOptionsReadyContext,
} from "../../../types";

import { assertPluginValue } from "../typeGuards/assertPluginValue.js";
import { resolveExtraOptions } from "../../plugins/logic/resolveExtraOptions";

/*
 * Validates plugin configuration layers used by the pipeline.
 *
 * Ensures that:
 * - only supported plugins are present
 * - plugin values have valid runtime shape
 *
 * Validates:
 * - resolved plugin state (`ctx.result.plugins`)
 * - plugin overlays from `extraOptions`
 *
 * After successful validation, plugin-related context types
 * can be treated as narrowed and runtime-safe.
 */
export const assertPluginOptions: PipelineMiddleware<PipelineContext, PluginOptionsReadyContext> = (
  ctx,
) => {
  const { supportedPlugins, extraOptions } = ctx;
  const { plugins } = ctx.result;

  const allowed = Object.keys(supportedPlugins);

  // Validate result.plugins
  for (const [name, value] of Object.entries(plugins)) {
    if (!allowed.includes(name)) {
      throw new Error(`[TestFramework] Unknown plugin "${name}" detected in plugins.`);
    }

    assertPluginValue(value, name, "plugins");
  }

  // Validate extraOptions entries that match plugin names
  for (const name of allowed) {
    if (Object.prototype.hasOwnProperty.call(extraOptions, name)) {
      assertPluginValue(resolveExtraOptions(extraOptions)[name], name, "extraOptions");
    }
  }

  return ctx as PluginOptionsReadyContext;
};
