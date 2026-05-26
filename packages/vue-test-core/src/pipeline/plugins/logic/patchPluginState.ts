import type { MountContext, PluginName, RuntimePluginState } from "../../../types";

import { patchResultState } from "../../state/patchResultState.js";
import { isPluginOverlayObject } from "../../middleware/typeGuards/isPluginOverlayObject.js";

/*
 * Safely patches configuration for a specific plugin into ctx.result.plugins.
 *
 * Rules:
 * - Existing plugin state is preserved
 * - New config is applied on top
 * - Performs shallow merge for a single plugin
 *
 * IMPORTANT:
 * - Assumes plugin is already enabled
 * - Does not handle `false`
 * - Mutates ctx through patchResultState()
 *
 * @example
 * patchPluginState(ctx, 'pinia', { someState: 123 })
 */
export function patchPluginState<T extends MountContext>(
  ctx: T,
  name: PluginName,
  config: RuntimePluginState,
): T {
  const current = ctx.result.plugins[name];

  const currentObj: RuntimePluginState = isPluginOverlayObject(current) ? current : {};

  return patchResultState(ctx, {
    plugins: {
      [name]: {
        ...currentObj,
        ...config,
      },
    },
  });
}
