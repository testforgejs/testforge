import { ERROR_PREFIX } from "../../constants/constants.js";
import { isPlainObject } from "../../guards/isPlainObject";
import type { PluginOptionsFactory } from "../../types";

/*
 * Builds plugin options from a validated options factory.
 *
 * The factory itself is validated during preset validation.
 * This function validates only the options object returned by the factory.
 */
export function buildPluginOptions<TOptions>(
  pluginName: string,
  factory: PluginOptionsFactory<TOptions>,
): TOptions {
  const options = factory();

  if (!isPlainObject(options)) {
    throw new Error(
      `${ERROR_PREFIX} Plugin options factory for "${pluginName}" ` + `must return a plain object.`,
    );
  }

  return options as TOptions;
}
