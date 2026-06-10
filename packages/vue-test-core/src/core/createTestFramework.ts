import type {
  CreateTestFrameworkOptions,
  ComponentFactory,
  ComponentFactoryOptions,
  ComponentFactoryExtraOptions,
  ComponentPropsInput,
  ComponentSlotsInput,
  ComponentDataInput,
  TestFramework,
  MountRuntimeOptions,
} from "../types";
import type { Component } from "vue";

import { mergeComponentData } from "../utils/mergeComponentData.js";
import { createPipelineContext } from "../pipeline/core/createPipelineContext.js";
import { createPipeline } from "../pipeline/core/createPipeline.js";
import { createMountPipeline } from "../pipeline/mount/createMountPipeline.js";
import { mountWithPlugins } from "./mountWithPlugins.js";

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
  const { presets = {}, shallowByDefault = false } = options;

  return {
    /*
     * Creates a reusable component mounting factory.
     *
     * The resulting factory supports:
     * - default props and slots
     * - plugin-aware mount configuration
     * - preset-based plugin resolution
     * - runtime mount pipeline processing
     */
    testComponentFactory<T extends Component>(
      component: T,
      defaultProps: ComponentPropsInput<T> = {},
      defaultMountOptions: ComponentFactoryOptions<
        ComponentPropsInput<T>,
        ComponentSlotsInput<T>,
        ComponentDataInput<T>
      > = {},
      defaultSlots: ComponentSlotsInput<T> = {},
    ): ComponentFactory<T> {
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
        const {
          skipDefaultProps = false,
          skipDefaultSlots = false,
          skipDefaultOptions = false,
        } = extraOptions;

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
          extraOptions,
          presets,
        });

        // Build and execute the mount pipeline
        const pipeline = createPipeline(createMountPipeline(ctx));
        pipeline.run(ctx);

        const mountRuntimeOptions: MountRuntimeOptions = {
          shallowByDefault,
        };

        // Mount the component with resolved plugin configuration
        return mountWithPlugins(
          component,
          ctx,
          {
            props: finalProps,
            slots: finalSlots,
          },
          mountRuntimeOptions,
        );
      };
    },
  };
}
