import type { Component } from "vue";

import type {
  ComponentFactoryCreationOptions,
  ComponentFactoryExtraOptions,
  ComponentFactoryInvocationOptions,
  ComponentPropsInput,
  ComponentSlotsInput,
} from "../../types.js";

import { mergeComponentData } from "../../utils/mergeComponentData.js";

/*
 * Combines factory defaults and invocation data into the props and slots
 * passed to the final mount. Does not mutate the supplied configuration.
 *
 * `resolvedExtraOptions` already includes any inherited factory preset key;
 * only its default-skipping controls affect the final component data.
 */
export function resolveFinalMountData<T extends Component>(
  factoryOptions: ComponentFactoryCreationOptions<T>,
  invocation: ComponentFactoryInvocationOptions<T>,
  resolvedExtraOptions: ComponentFactoryExtraOptions,
): { props: ComponentPropsInput<T>; slots: ComponentSlotsInput<T> } {
  const { defaultProps = {}, defaultMountOptions = {}, defaultSlots = {} } = factoryOptions;
  const { props = {}, mountOptions = {}, slots = {} } = invocation;
  const {
    skipDefaultProps = false,
    skipDefaultSlots = false,
    skipDefaultOptions = false,
  } = resolvedExtraOptions;

  return {
    props: mergeComponentData({
      defaultMountData: defaultMountOptions.props,
      defaultData: defaultProps,
      mountData: mountOptions.props,
      directData: props,
      skipDefault: skipDefaultProps,
      skipOptions: skipDefaultOptions,
    }),
    slots: mergeComponentData({
      defaultMountData: defaultMountOptions.slots,
      defaultData: defaultSlots,
      mountData: mountOptions.slots,
      directData: slots,
      skipDefault: skipDefaultSlots,
      skipOptions: skipDefaultOptions,
    }),
  };
}
