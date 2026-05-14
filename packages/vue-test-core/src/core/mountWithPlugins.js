import { mount, shallowMount } from "@vue/test-utils";
import { createPlugins } from "../pluginsRegistry/createPlugins.js";

/**
 * Mounts a component with required plugins
 * @param {object} component - Vue Component
 * @param {MountContext} ctx - Mount context
 * @param {object} overrides - Override mounting options
 * @returns {import('@vue/test-utils').VueWrapper}
 */
export function mountWithPlugins(component, ctx, overrides = {}) {
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
