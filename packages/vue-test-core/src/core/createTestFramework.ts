import type { Component } from "vue";

import type {
  ComponentFactory,
  ComponentFactoryConfig,
  ComponentFactoryCreator,
  CreateTestFrameworkOptions,
  DefaultMountOptionsResolver,
  DefaultPropsResolver,
  DefaultSlotsResolver,
  FactoryOptionsResolver,
  TestFramework,
} from "../types.js";
import type { FrameworkRuntimeContext } from "./types.js";

import { createComponentFactory } from "./componentFactory.js";
import { createPositionalComponentFactory } from "./positionalFactoryAdapter.js";
import { resolvePresets } from "./utils/resolvePresets.js";
import { validateCreateTestFrameworkOptions } from "../validators/validateCreateTestFrameworkOptions.js";

/*
 * Creates a TestForge framework and binds its runtime dependencies
 * to the positional and object-based component factory creation APIs.
 */
export function createTestFramework(options: CreateTestFrameworkOptions = {}): TestFramework {
  validateCreateTestFrameworkOptions(options);

  const context: FrameworkRuntimeContext = {
    presets: resolvePresets(options),
    shallowByDefault: options.shallowByDefault ?? false,
  };

  // Adapt positional factory creation without exposing the internal context.
  const positionalFactory = <T extends Component>(
    component: T,
    defaultProps?: DefaultPropsResolver<NoInfer<T>>,
    defaultMountOptions?: DefaultMountOptionsResolver<NoInfer<T>>,
    defaultSlots?: DefaultSlotsResolver<NoInfer<T>>,
    config: ComponentFactoryConfig = {},
  ): ComponentFactory<T> => {
    return createPositionalComponentFactory(
      context,
      component,
      defaultProps,
      defaultMountOptions,
      defaultSlots,
      config,
    );
  };

  // The object-based API delegates to the shared resolver-based factory.
  const withOptions = <T extends Component>(
    resolveOptions: FactoryOptionsResolver<T>,
  ): ComponentFactory<T> => {
    return createComponentFactory(context, resolveOptions);
  };

  const testComponentFactory: ComponentFactoryCreator = Object.assign(positionalFactory, {
    withOptions,
  });

  return { testComponentFactory };
}
