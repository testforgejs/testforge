import type { MountContext, MountWithPluginsOptions } from "../types";
import type { Component } from "vue";
import type { VueWrapper } from "@vue/test-utils";

import { mount, shallowMount } from "@vue/test-utils";
import { createPlugins } from "../pluginsRegistry/createPlugins.js";

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

  // IMPORTANT: Safe merge
  const finalGlobal = {
    ...result.global,
    ...overrideGlobal,
  };

  if (globalPlugins.length > 0) {
    finalGlobal.plugins = [...(finalGlobal.plugins || []), ...globalPlugins];
  }

  return mountFunction(component, {
    ...restOptions,
    global: finalGlobal,
  });
}
