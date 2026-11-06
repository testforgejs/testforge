import type {
  ComponentDataInput,
  ComponentFactoryConfig,
  ComponentFactoryCreator,
  ComponentFactoryInvocationOptions,
  ComponentFactory,
  ComponentFactoryOptions,
  ComponentFactoryExtraOptions,
  ComponentPropsInput,
  ComponentSlotsInput,
  CreateTestFrameworkOptions,
  FactoryOptionsResolver,
  DefaultPropsResolver,
  DefaultMountOptionsResolver,
  DefaultSlotsResolver,
  MountRuntimeOptions,
  TestFramework,
} from "../types.js";

import type { Component } from "vue";

import { ERROR_PREFIX } from "../constants/constants.js";
import { mergeComponentData } from "../utils/mergeComponentData.js";
import { createPipelineContext } from "../pipeline/core/createPipelineContext.js";
import { createPipeline } from "../pipeline/core/createPipeline.js";
import { createMountPipeline } from "../pipeline/mount/createMountPipeline.js";
import { mountWithPlugins } from "./mountWithPlugins.js";
import { resolveMountExtraOptions } from "./utils/resolveMountExtraOptions.js";
import { resolvePresets } from "./utils/resolvePresets.js";
import { validateCreateTestFrameworkOptions } from "../validators/validateCreateTestFrameworkOptions.js";
import { validateComponentFactoryArguments } from "../validators/validateComponentFactoryArguments.js";
import { validateComponentFactoryCreationOptions } from "../validators/validateComponentFactoryCreationOptions.js";
import { validateComponentFactoryInvocationOptions } from "../validators/validateComponentFactoryInvocationOptions.js";
import { validatePlainObjectArgument } from "../validators/validatePlainObjectArgument.js";
import { validateComponentFactoryConfig } from "../validators/validateComponentFactoryConfig.js";
import { validateComponentFactoryDefaultResolvers } from "../validators/validateComponentFactoryDefaultResolvers.js";
import { validateComponent } from "../validators/validateComponent.js";

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
   * Shared by positional and object-based factory creation.
   * Resolves fresh factory configuration for each mount and returns
   * a callable component factory supporting both invocation forms.
   */
  const createComponentFactory = <T extends Component>(
    resolveOptions: FactoryOptionsResolver<T>,
  ): ComponentFactory<T> => {
    if (typeof resolveOptions !== "function") {
      throw new TypeError(`${ERROR_PREFIX} Factory options resolver must be a function.`);
    }

    // Shared mount implementation for positional and object-based calls.
    const mountComponent = (
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

      // Resolve fresh factory configuration for this mount.
      const factoryOptions = resolveOptions();

      // Validate the resolved configuration.
      validateComponentFactoryCreationOptions(factoryOptions, presets);

      const {
        component,
        defaultProps = {},
        defaultMountOptions = {},
        defaultSlots = {},
        presetKey: factoryPresetKey,
      } = factoryOptions;

      // Resolve mount options with factory-level preset inheritance.
      const resolvedExtraOptions = resolveMountExtraOptions(extraOptions, factoryPresetKey);

      // Validate mount arguments against the effective preset,
      // while preserving the original user-provided mount options.
      validateComponentFactoryArguments(props, mountOptions, slots, resolvedExtraOptions, presets);

      const {
        skipDefaultProps = false,
        skipDefaultSlots = false,
        skipDefaultOptions = false,
      } = resolvedExtraOptions;

      // Resolve final props.
      const finalProps = mergeComponentData({
        defaultMountData: defaultMountOptions.props,
        defaultData: defaultProps,
        mountData: mountOptions.props,
        directData: props,
        skipDefault: skipDefaultProps,
        skipOptions: skipDefaultOptions,
      });

      // Resolve final slots.
      const finalSlots = mergeComponentData({
        defaultMountData: defaultMountOptions.slots,
        defaultData: defaultSlots,
        mountData: mountOptions.slots,
        directData: slots,
        skipDefault: skipDefaultSlots,
        skipOptions: skipDefaultOptions,
      });

      // Create the initial pipeline context.
      const ctx = createPipelineContext({
        defaultMountOptions,
        mountOptions,
        extraOptions: resolvedExtraOptions,
        presets,
      });

      // Build and execute the mount pipeline.
      const pipeline = createPipeline(createMountPipeline(ctx));
      const readyCtx = pipeline.run(ctx);

      const mountRuntimeOptions: MountRuntimeOptions = {
        shallowByDefault,
      };

      // Mount the component with resolved plugin configuration.
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

    /*
     * Adapts named mount arguments to the shared positional implementation.
     * Public API documentation is defined in ComponentFactory<T>.
     */
    const mountWithOptions = (options: ComponentFactoryInvocationOptions<T>) => {
      validateComponentFactoryInvocationOptions(options);

      const { props, mountOptions, slots, extraOptions } = options;

      return mountComponent(props, mountOptions, slots, extraOptions);
    };

    return Object.assign(mountComponent, { withOptions: mountWithOptions });
  };

  /*
   * Positional component factory implementation.
   *
   * Adapts independent default configuration factories to the shared
   * options resolver. Each supplied factory is invoked once per mount.
   *
   * Public API documentation is defined in ComponentFactoryCreator.
   */
  const createPositionalComponentFactory = <T extends Component>(
    component: T,
    defaultProps?: DefaultPropsResolver<NoInfer<T>>,
    defaultMountOptions?: DefaultMountOptionsResolver<NoInfer<T>>,
    defaultSlots?: DefaultSlotsResolver<NoInfer<T>>,
    config: ComponentFactoryConfig = {},
  ): ComponentFactory<T> => {
    // Validate static arguments during factory creation.
    validateComponent(component);

    // Validate the supplied resolver functions before creating the factory.
    validateComponentFactoryDefaultResolvers(defaultProps, defaultMountOptions, defaultSlots);

    validateComponentFactoryConfig(config, presets);

    const { presetKey } = config;

    const resolveOptions: FactoryOptionsResolver<T> = () => ({
      component,

      ...(defaultProps !== undefined ? { defaultProps: defaultProps() } : {}),

      ...(defaultMountOptions !== undefined ? { defaultMountOptions: defaultMountOptions() } : {}),

      ...(defaultSlots !== undefined ? { defaultSlots: defaultSlots() } : {}),

      ...(presetKey !== undefined ? { presetKey } : {}),
    });

    return createComponentFactory(resolveOptions);
  };

  /*
   * Object-based component factory implementation.
   *
   * Delegates configuration resolution to the shared component factory.
   * The resolver is invoked once per mount, not during factory creation.
   *
   * Public API documentation is defined in ComponentFactoryCreator.
   */
  const withOptions = <T extends Component>(
    resolveOptions: FactoryOptionsResolver<T>,
  ): ComponentFactory<T> => {
    return createComponentFactory(resolveOptions);
  };

  /*
   * Public component factory creator.
   *
   * Supports both:
   * - testComponentFactory(Component, defaultProps, defaultMountOptions, defaultSlots, config)
   * - testComponentFactory.withOptions(resolveOptions)
   */
  const testComponentFactory: ComponentFactoryCreator = Object.assign(
    createPositionalComponentFactory,
    { withOptions },
  );

  return { testComponentFactory };
}
