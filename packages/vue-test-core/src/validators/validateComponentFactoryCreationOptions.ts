import type { Component } from "vue";

import { validateComponentFactoryConfig } from "./validateComponentFactoryConfig.js";
import { validateTestComponentFactoryArguments } from "./validateTestComponentFactoryArguments.js";
import { validateFactoryPresetPlugins } from "./validateFactoryPresetPlugins.js";

import type { ComponentFactoryCreationOptions, TestFrameworkPresets } from "../types.js";

/*
 * Validates component factory configuration returned by a resolver.
 *
 * Delegates factory configuration and resolved argument validation
 * to their respective validators.
 */
export function validateComponentFactoryCreationOptions(
  options: unknown,
  presets: TestFrameworkPresets,
): void {
  validateComponentFactoryConfig(options, presets, "options");

  const {
    component,
    defaultProps = {},
    defaultMountOptions = {},
    defaultSlots = {},
    presetKey,
  } = options as ComponentFactoryCreationOptions<Component>; // TODO type guard

  validateTestComponentFactoryArguments(
    component,
    defaultProps,
    defaultMountOptions,
    defaultSlots,
    presets,
    presetKey,
  );

  validateFactoryPresetPlugins(defaultMountOptions, presetKey, presets);
}
