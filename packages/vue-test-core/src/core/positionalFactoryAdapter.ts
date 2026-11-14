import type { Component } from "vue";

import type {
  ComponentFactory,
  ComponentFactoryConfig,
  DefaultMountOptionsResolver,
  DefaultPropsResolver,
  DefaultSlotsResolver,
  FactoryOptionsResolver,
} from "../types.js";
import type { FrameworkRuntimeContext } from "./types.js";

import { validateComponent } from "../validators/validateComponent.js";
import { validateComponentFactoryConfig } from "../validators/validateComponentFactoryConfig.js";
import { validateComponentFactoryDefaultResolvers } from "../validators/validateComponentFactoryDefaultResolvers.js";
import { createComponentFactory } from "./componentFactory.js";

/*
 * Adapts positional factory creation arguments to a per-mount options resolver.
 * Static arguments are validated during factory creation; supplied default
 * resolvers are evaluated once per mount by the shared component factory.
 */
export function createPositionalComponentFactory<T extends Component>(
  context: FrameworkRuntimeContext,
  component: T,
  defaultProps?: DefaultPropsResolver<NoInfer<T>>,
  defaultMountOptions?: DefaultMountOptionsResolver<NoInfer<T>>,
  defaultSlots?: DefaultSlotsResolver<NoInfer<T>>,
  config: ComponentFactoryConfig = {},
): ComponentFactory<T> {
  validateComponent(component);
  validateComponentFactoryDefaultResolvers(defaultProps, defaultMountOptions, defaultSlots);
  validateComponentFactoryConfig(config, context.presets);

  const { presetKey } = config;

  const resolveOptions: FactoryOptionsResolver<T> = () => ({
    component,
    ...(defaultProps !== undefined ? { defaultProps: defaultProps() } : {}),
    ...(defaultMountOptions !== undefined ? { defaultMountOptions: defaultMountOptions() } : {}),
    ...(defaultSlots !== undefined ? { defaultSlots: defaultSlots() } : {}),
    ...(presetKey !== undefined ? { presetKey } : {}),
  });

  return createComponentFactory(context, resolveOptions);
}
