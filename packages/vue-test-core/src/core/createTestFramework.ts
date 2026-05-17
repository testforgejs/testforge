import type {
  SlotsMap,
  Dictionary,
  CreateTestFrameworkOptions,
  ComponentFactory,
  ComponentFactoryOptions,
  ComponentFactoryExtraOptions,
  TestFramework,
} from "../types";
import type { Component } from "vue";

import { mergeComponentData } from "../utils/mergeComponentData.js";
import { createMountContext } from "../pipeline/createMountContext.js";
import { createPipeline } from "../pipeline/createPipeline.js";
import { createMountPipeline } from "../pipeline/createMountPipeline.js";
import { mountWithPlugins } from "./mountWithPlugins.js";

export function createTestFramework(options: CreateTestFrameworkOptions = {}): TestFramework {
  const { presets = {} } = options;

  return {
    testComponentFactory(
      component: Component,
      defaultProps: Dictionary = {},
      defaultMountOptions: ComponentFactoryOptions = {},
      defaultSlots: SlotsMap = {},
    ): ComponentFactory {
      return (
        props: Dictionary = {},
        mountOptions: ComponentFactoryOptions = {},
        slots: SlotsMap = {},
        extraOptions: ComponentFactoryExtraOptions = {},
      ) => {
        const {
          skipDefaultProps = false,
          skipDefaultSlots = false,
          skipDefaultOptions = false,
        } = extraOptions;

        // Merging props and slots (basic)
        const finalProps = mergeComponentData({
          defaultMountData: defaultMountOptions.props,
          defaultData: defaultProps,
          mountData: mountOptions.props,
          directData: props,
          skipDefault: skipDefaultProps,
          skipOptions: skipDefaultOptions,
        });
        const finalSlots: SlotsMap = mergeComponentData({
          defaultMountData: defaultMountOptions.slots,
          defaultData: defaultSlots,
          mountData: mountOptions.slots,
          directData: slots,
          skipDefault: skipDefaultSlots,
          skipOptions: skipDefaultOptions,
        });

        const ctx = createMountContext({
          defaultMountOptions,
          mountOptions,
          extraOptions,
          presets,
        });

        const pipeline = createPipeline(createMountPipeline(ctx));
        pipeline.run(ctx);

        return mountWithPlugins(component, ctx, {
          props: finalProps,
          slots: finalSlots,
        });
      };
    },
  };
}
