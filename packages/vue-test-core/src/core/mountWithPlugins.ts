import type { MountContext, MountWithPluginsOptions } from "../types";
import type { Component } from "vue";
import type { VueWrapper } from "@vue/test-utils";

import { mount, shallowMount } from "@vue/test-utils";
import { createPlugins } from "../pluginsRegistry/createPlugins.js";

/*
 * Mounts a component using the fully resolved framework context.
 *
 * Responsibilities:
 * - resolve final mount options
 * - create runtime Vue plugins
 * - merge global mounting configuration
 * - choose between mount() and shallowMount()
 */
export function mountWithPlugins(
  component: Component,
  ctx: MountContext,
  overrides: MountWithPluginsOptions = {},
): VueWrapper {
  const { result } = ctx;

  const mergedOptions = {
    ...result.mountOptions,
    ...overrides,
    plugins: result.plugins,
  };

  const {
    useShallow = true,
    plugins = {},
    skipManagedPlugins = false,
    global: overrideGlobal,
    ...restOptions
  } = mergedOptions;

  const mountFunction = useShallow ? shallowMount : mount;
  const globalPlugins = skipManagedPlugins ? [] : createPlugins(plugins, ctx);

  // Merge resolved global config with runtime overrides
  const finalGlobal = {
    ...result.global,
    ...overrideGlobal,
  };

  // Inject managed Vue plugins into global.plugins
  if (globalPlugins.length > 0) {
    finalGlobal.plugins = [...(finalGlobal.plugins || []), ...globalPlugins];
  }

  return mountFunction(component, {
    ...restOptions,
    global: finalGlobal,
  });
}
