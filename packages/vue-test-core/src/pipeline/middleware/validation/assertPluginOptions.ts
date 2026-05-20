import type { PipelineMiddleware, MountContext, PluginOptionsReadyContext } from "../../../types";

import { assertPluginValue } from "../typeGuards/assertPluginValue.js";

/*
 * Validates plugin configurations in result.plugins and extraOptions.
 * Strengthens ctx types for plugins after validation.
 */
export const assertPluginOptions: PipelineMiddleware<MountContext, PluginOptionsReadyContext> = (
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
      assertPluginValue((extraOptions as Record<string, unknown>)[name], name, "extraOptions");
    }
  }

  return ctx as PluginOptionsReadyContext;
};
