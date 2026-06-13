import { validatePlainObjectArgument } from "./validatePlainObjectArgument.js";
import { validateBooleanOption } from "./validateBooleanOption.js";
import { warnRootPluginOptions } from "./warnRootPluginOptions.js";

import type { ComponentFactoryExtraOptions, TestFrameworkPresets } from "../types";

/*
 * Validates ComponentFactoryExtraOptions objects used by TestForge.
 *
 * Runtime checks:
 * - the configuration itself must be a plain object
 * - `skipDefaultProps`, when provided, must be a boolean
 * - `skipDefaultSlots`, when provided, must be a boolean
 * - `skipDefaultOptions`, when provided, must be a boolean
 *
 * DX checks:
 * - detects plugin overrides mistakenly placed at the root level
 * - emits warnings suggesting the correct `plugins.<pluginName>` location
 *
 * The active preset is resolved from the provided extra options and
 * determines which plugin names are considered managed by TestForge.
 */
export function validateComponentFactoryExtraOptions(
  options: ComponentFactoryExtraOptions,
  presets: TestFrameworkPresets = {},
): void {
  validatePlainObjectArgument(options, "extraOptions");

  validateBooleanOption(options.skipDefaultProps, "skipDefaultProps");
  validateBooleanOption(options.skipDefaultSlots, "skipDefaultSlots");
  validateBooleanOption(options.skipDefaultOptions, "skipDefaultOptions");

  warnRootPluginOptions(options, "extraOptions", presets, options);
}
