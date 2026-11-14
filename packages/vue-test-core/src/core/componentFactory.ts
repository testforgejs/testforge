import type { Component } from "vue";

import type {
  ComponentDataInput,
  ComponentFactory,
  ComponentFactoryExtraOptions,
  ComponentFactoryInvocationOptions,
  ComponentFactoryOptions,
  ComponentPropsInput,
  ComponentSlotsInput,
  FactoryOptionsResolver,
} from "../types.js";
import type { FrameworkRuntimeContext } from "./types.js";

import { ERROR_PREFIX } from "../constants/constants.js";
import { validateComponentFactoryInvocationOptions } from "../validators/validateComponentFactoryInvocationOptions.js";
import { executeMount } from "./mountExecutor.js";

/*
 * Creates a reusable component factory shared by both creation APIs.
 * Resolves fresh factory configuration on every mount and supports
 * positional and object-based mount invocations.
 */
export function createComponentFactory<T extends Component>(
  context: FrameworkRuntimeContext,
  resolveOptions: FactoryOptionsResolver<T>,
): ComponentFactory<T> {
  if (typeof resolveOptions !== "function") {
    throw new TypeError(`${ERROR_PREFIX} Factory options resolver must be a function.`);
  }

  // Shared implementation for both mount invocation forms.
  const mountComponent = (
    props: ComponentPropsInput<T> = {},
    mountOptions: ComponentFactoryOptions<
      ComponentPropsInput<T>,
      ComponentSlotsInput<T>,
      ComponentDataInput<T>
    > = {},
    slots: ComponentSlotsInput<T> = {},
    extraOptions: ComponentFactoryExtraOptions = {},
  ): ReturnType<ComponentFactory<T>> => {
    return executeMount(context, resolveOptions, {
      props,
      mountOptions,
      slots,
      extraOptions,
    });
  };

  // Adapts named mount arguments to the same positional implementation.
  const mountWithOptions = (
    options: ComponentFactoryInvocationOptions<T>,
  ): ReturnType<ComponentFactory<T>> => {
    validateComponentFactoryInvocationOptions(options);

    const { props, mountOptions, slots, extraOptions } = options;

    return mountComponent(props, mountOptions, slots, extraOptions);
  };

  return Object.assign(mountComponent, { withOptions: mountWithOptions });
}
