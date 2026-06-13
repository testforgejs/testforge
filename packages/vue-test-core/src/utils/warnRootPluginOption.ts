import { ERROR_PREFIX } from "../constants/constants.js";

import type { OptionsContext } from "../types";

/*
 * Emits a warning when a plugin option is placed at the root
 * of ComponentFactoryOptions instead of under the `plugins` field.
 *
 * Example:
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
 */
export function warnRootPluginOption(pluginName: string, context: OptionsContext): void {
  console.warn(
    [
      `${ERROR_PREFIX} Detected plugin option "${pluginName}" at the root of "${context}".`,
      "",
      "Plugin options must be placed under:",
      "",
      "{",
      "  plugins: {",
      `    ${pluginName}: { ... }`,
      "  }",
      "}",
      "",
      `Did you mean to use "${context}.plugins.${pluginName}"?`,
    ].join("\n"),
  );
}
