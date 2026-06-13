import { getSupportedPluginNames } from "../utils/getSupportedPluginNames.js";
import { warnRootPluginOption } from "../utils/warnRootPluginOption.js";

import type {
  ComponentFactoryOptions,
  ComponentFactoryExtraOptions,
  TestFrameworkPresets,
  OptionsContext,
} from "../types";

/*
 * Warns when plugin options are placed at the root level instead
 * of under the `plugins` field.
 *
 * This check is intended to improve DX by detecting a common mistake:
 *
 * Incorrect:
 * {
 *   i18n: { ... }
 * }
 *
 * Correct:
 * {
 *   plugins: {
 *     i18n: { ... }
 *   }
 * }
 *
 * The warning is emitted only when:
 * - the option name matches a plugin declared in the active preset
 * - the same plugin is not already present under `plugins`
 */
export function warnRootPluginOptions(
  options: ComponentFactoryOptions | ComponentFactoryExtraOptions,
  context: OptionsContext,
  presets: TestFrameworkPresets = {},
  extraOptions?: ComponentFactoryExtraOptions,
): void {
  const pluginNames = getSupportedPluginNames(presets, extraOptions);

  pluginNames.forEach((pluginName) => {
    const pluginAlreadyConfigured = options.plugins && pluginName in options.plugins;

    if (Object.hasOwn(options, pluginName) && !pluginAlreadyConfigured) {
      warnRootPluginOption(pluginName, context);
    }
  });
}
