import type {
  CreateTestFrameworkOptions,
  ComponentFactoryCreator,
  ComponentFactoryCreationOptions,
  ComponentFactory,
  ComponentFactoryOptions,
  ComponentFactoryExtraOptions,
  ComponentPropsInput,
  ComponentSlotsInput,
  ComponentDataInput,
  TestFramework,
  MountRuntimeOptions,
  ComponentFactoryConfig,
} from "../types.js";

import type { Component } from "vue";

import { mergeComponentData } from "../utils/mergeComponentData.js";
import { createPipelineContext } from "../pipeline/core/createPipelineContext.js";
import { createPipeline } from "../pipeline/core/createPipeline.js";
import { createMountPipeline } from "../pipeline/mount/createMountPipeline.js";
import { mountWithPlugins } from "./mountWithPlugins.js";
import { validateCreateTestFrameworkOptions } from "../validators/validateCreateTestFrameworkOptions.js";
import { validateTestComponentFactoryArguments } from "../validators/validateTestComponentFactoryArguments.js";
import { validateComponentFactoryArguments } from "../validators/validateComponentFactoryArguments.js";
import { validateComponentFactoryCreationOptions } from "../validators/validateComponentFactoryCreationOptions.js";
import { resolvePresets } from "./utils/resolvePresets.js";
import { validatePlainObjectArgument } from "../validators/validatePlainObjectArgument.js";
import { validateComponentFactoryConfig } from "../validators/validateComponentFactoryConfig.js";
import { validateFactoryPresetPlugins } from "../validators/validateFactoryPresetPlugins.js";

/*
 * Creates the main TestFramework instance.
 *
 * The framework coordinates:
 * - plugin presets
 * - mount configuration resolution
 * - pipeline execution
 * - plugin-aware mounting
 */
export function createTestFramework(options: CreateTestFrameworkOptions = {}): TestFramework {
  validateCreateTestFrameworkOptions(options);

  const { shallowByDefault = false } = options;
  const presets = resolvePresets(options);

  /*
   * Internal component factory implementation.
   *
   * Supports a factory-level preset selection while preserving
   * the existing positional API.
   *
   * The factoryPresetKey parameter is internal and is not exposed
   * through the public positional signature.
   */
  const createComponentFactory = <T extends Component>(
    component: T,
    defaultProps: ComponentPropsInput<T> = {},
    defaultMountOptions: ComponentFactoryOptions<
      ComponentPropsInput<T>,
      ComponentSlotsInput<T>,
      ComponentDataInput<T>
    > = {},
    defaultSlots: ComponentSlotsInput<T> = {},
    config: ComponentFactoryConfig = {},
  ): ComponentFactory<T> => {
    validateComponentFactoryConfig(config, presets);

    const factoryPresetKey = config.presetKey;

    validateTestComponentFactoryArguments(
      component,
      defaultProps,
      defaultMountOptions,
      defaultSlots,
      presets,
      factoryPresetKey,
    );

    validateFactoryPresetPlugins(defaultMountOptions, factoryPresetKey, presets);

    return (
      props: ComponentPropsInput<T> = {},
      mountOptions: ComponentFactoryOptions<
        ComponentPropsInput<T>,
        ComponentSlotsInput<T>,
        ComponentDataInput<T>
      > = {},
      slots: ComponentSlotsInput<T> = {},
      extraOptions: ComponentFactoryExtraOptions = {},
    ) => {
      // Validate the raw argument before accessing its properties.
      validatePlainObjectArgument(extraOptions, "extraOptions");

      // Mount-level preset selection overrides the factory-level default.
      const resolvedExtraOptions: ComponentFactoryExtraOptions =
        extraOptions.presetKey !== undefined || factoryPresetKey === undefined
          ? extraOptions
          : {
              ...extraOptions,
              presetKey: factoryPresetKey,
            };

      // Validate mount arguments against the effective preset,
      // while preserving the original user-provided mount options.
      validateComponentFactoryArguments(props, mountOptions, slots, resolvedExtraOptions, presets);

      const {
        skipDefaultProps = false,
        skipDefaultSlots = false,
        skipDefaultOptions = false,
      } = resolvedExtraOptions;

      // Resolve final props
      const finalProps = mergeComponentData({
        defaultMountData: defaultMountOptions.props,
        defaultData: defaultProps,
        mountData: mountOptions.props,
        directData: props,
        skipDefault: skipDefaultProps,
        skipOptions: skipDefaultOptions,
      });

      // Resolve final slots
      const finalSlots = mergeComponentData({
        defaultMountData: defaultMountOptions.slots,
        defaultData: defaultSlots,
        mountData: mountOptions.slots,
        directData: slots,
        skipDefault: skipDefaultSlots,
        skipOptions: skipDefaultOptions,
      });

      // Create the initial pipeline context
      const ctx = createPipelineContext({
        defaultMountOptions,
        mountOptions,
        extraOptions: resolvedExtraOptions,
        presets,
      });

      // Build and execute the mount pipeline
      const pipeline = createPipeline(createMountPipeline(ctx));
      const readyCtx = pipeline.run(ctx);

      const mountRuntimeOptions: MountRuntimeOptions = {
        shallowByDefault,
      };

      // Mount the component with resolved plugin configuration
      return mountWithPlugins(
        component,
        readyCtx,
        {
          props: finalProps,
          slots: finalSlots,
        },
        mountRuntimeOptions,
      );
    };
  };

  /*
   * Object-based component factory API.
   *
   * Adapts the creation options to the existing internal
   * component factory implementation.
   */
  const withOptions = <T extends Component>(
    options: ComponentFactoryCreationOptions<T>,
  ): ComponentFactory<T> => {
    validateComponentFactoryCreationOptions(options, presets);

    const { component, presetKey, defaultProps, defaultMountOptions, defaultSlots } = options;

    return createComponentFactory(component, defaultProps, defaultMountOptions, defaultSlots, {
      presetKey,
    });
  };

  /*
   * Public component factory creator.
   *
   * Supports both:
   * - testComponentFactory(Component, ...)
   * - testComponentFactory.withOptions({ component, ... })
   */
  const testComponentFactory: ComponentFactoryCreator = Object.assign(createComponentFactory, {
    withOptions,
  });

  return { testComponentFactory };
}
