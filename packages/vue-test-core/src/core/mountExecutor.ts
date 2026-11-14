import type { Component } from "vue";

import type {
  ComponentFactory,
  ComponentFactoryInvocationOptions,
  FactoryOptionsResolver,
  MountRuntimeOptions,
} from "../types.js";
import type { FrameworkRuntimeContext } from "./types.js";

import { mergeComponentData } from "../utils/mergeComponentData.js";
import { createPipelineContext } from "../pipeline/core/createPipelineContext.js";
import { createPipeline } from "../pipeline/core/createPipeline.js";
import { createMountPipeline } from "../pipeline/mount/createMountPipeline.js";
import { mountWithPlugins } from "./mountWithPlugins.js";
import { resolveMountExtraOptions } from "./utils/resolveMountExtraOptions.js";
import { validateComponentFactoryArguments } from "../validators/validateComponentFactoryArguments.js";
import { validateComponentFactoryCreationOptions } from "../validators/validateComponentFactoryCreationOptions.js";
import { validatePlainObjectArgument } from "../validators/validatePlainObjectArgument.js";

/*
 * Resolves factory and mount configuration, executes the mount pipeline,
 * and mounts a component with its managed plugins.
 *
 * The factory options resolver is evaluated exactly once per invocation.
 * Validation of the object-based invocation shape belongs to the factory
 * adapter; this executor preserves the positional API's validation order.
 */
export function executeMount<T extends Component>(
  context: FrameworkRuntimeContext,
  resolveOptions: FactoryOptionsResolver<T>,
  invocation: ComponentFactoryInvocationOptions<T>,
): ReturnType<ComponentFactory<T>> {
  const { presets, shallowByDefault } = context;
  const { props = {}, mountOptions = {}, slots = {}, extraOptions = {} } = invocation;

  // Validate raw extra options before invoking the factory resolver.
  validatePlainObjectArgument(extraOptions, "extraOptions");

  // Resolve and validate fresh factory configuration for this mount.
  const factoryOptions = resolveOptions();
  validateComponentFactoryCreationOptions(factoryOptions, presets);

  const {
    component,
    defaultProps = {},
    defaultMountOptions = {},
    defaultSlots = {},
    presetKey: factoryPresetKey,
  } = factoryOptions;

  // Mount-level preset selection overrides the factory-level selection.
  const resolvedExtraOptions = resolveMountExtraOptions(extraOptions, factoryPresetKey);

  // Validate against the effective preset without changing mount inputs.
  validateComponentFactoryArguments(props, mountOptions, slots, resolvedExtraOptions, presets);

  const {
    skipDefaultProps = false,
    skipDefaultSlots = false,
    skipDefaultOptions = false,
  } = resolvedExtraOptions;

  const finalProps = mergeComponentData({
    defaultMountData: defaultMountOptions.props,
    defaultData: defaultProps,
    mountData: mountOptions.props,
    directData: props,
    skipDefault: skipDefaultProps,
    skipOptions: skipDefaultOptions,
  });

  const finalSlots = mergeComponentData({
    defaultMountData: defaultMountOptions.slots,
    defaultData: defaultSlots,
    mountData: mountOptions.slots,
    directData: slots,
    skipDefault: skipDefaultSlots,
    skipOptions: skipDefaultOptions,
  });

  const ctx = createPipelineContext({
    defaultMountOptions,
    mountOptions,
    extraOptions: resolvedExtraOptions,
    presets,
  });

  const pipeline = createPipeline(createMountPipeline(ctx));
  const readyCtx = pipeline.run(ctx);

  const mountRuntimeOptions: MountRuntimeOptions = {
    shallowByDefault,
  };

  return mountWithPlugins(
    component,
    readyCtx,
    {
      props: finalProps,
      slots: finalSlots,
    },
    mountRuntimeOptions,
  );
}
