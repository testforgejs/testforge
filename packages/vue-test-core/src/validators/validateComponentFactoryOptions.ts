import { validatePlainObjectArgument } from "./validatePlainObjectArgument.js";
import { validateBooleanOption } from "./validateBooleanOption.js";
import { warnRootPluginOptions } from "./warnRootPluginOptions.js";

import type {
  ComponentFactoryOptions,
  ComponentFactoryExtraOptions,
  TestFrameworkPresets,
  OptionsContext,
} from "../types";

/*
 * Validates ComponentFactoryOptions objects used by TestForge.
 *
 * Runtime checks:
 * - the configuration itself must be a plain object
 * - `skipManagedPlugins`, when provided, must be a boolean
 *
 * DX checks:
 * - detects plugin options mistakenly placed at the root level
 * - emits warnings suggesting the correct `plugins.<pluginName>` location
 *
 * The `context` parameter identifies which configuration object is
 * being validated (for example, "defaultMountOptions", "mountOptions",
 * or "extraOptions") and is used to produce more informative error
 * and warning messages.
 */
export function validateComponentFactoryOptions(
  options: ComponentFactoryOptions,
  context: OptionsContext,
  presets: TestFrameworkPresets = {},
  extraOptions?: ComponentFactoryExtraOptions,
): void {
  validatePlainObjectArgument(options, context);

  validateBooleanOption(options.skipManagedPlugins, "skipManagedPlugins");

  warnRootPluginOptions(options, context, presets, extraOptions);
}
