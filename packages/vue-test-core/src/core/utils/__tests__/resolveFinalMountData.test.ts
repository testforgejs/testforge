import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Component } from "vue";

import type {
  ComponentFactoryCreationOptions,
  ComponentFactoryExtraOptions,
  ComponentFactoryInvocationOptions,
} from "../../../types.js";

import { mergeComponentData } from "../../../utils/mergeComponentData.js";
import { resolveFinalMountData } from "../resolveFinalMountData.js";

vi.mock("../../../utils/mergeComponentData.js", () => ({
  mergeComponentData: vi.fn(),
}));

const component: Component = { name: "MockComponent", render: () => null };
const mockMerge = vi.mocked(mergeComponentData);

const createFactoryOptions = (): ComponentFactoryCreationOptions<Component> => ({ component });

beforeEach(() => {
  vi.resetAllMocks();
  mockMerge.mockReturnValue({} as never);
});

describe("resolveFinalMountData", () => {
  it("passes all props and slots sources to the merge helper and returns the merged data", () => {
    const defaultProps = { title: "Factory" };
    const defaultMountProps = { count: 1 };
    const mountProps = { count: 2 };
    const props = { title: "Mount" };
    const defaultSlots = { default: () => "Factory" };
    const defaultMountSlots = { footer: () => "Default mount" };
    const mountSlots = { footer: () => "Mount options" };
    const slots = { default: () => "Mount" };
    const factoryOptions: ComponentFactoryCreationOptions<Component> = {
      component,
      defaultProps,
      defaultMountOptions: { props: defaultMountProps, slots: defaultMountSlots },
      defaultSlots,
    };
    const invocation: ComponentFactoryInvocationOptions<Component> = {
      props,
      mountOptions: { props: mountProps, slots: mountSlots },
      slots,
    };
    const finalProps = { title: "Mount", count: 2 };
    const finalSlots = { default: slots.default, footer: mountSlots.footer };
    mockMerge.mockReturnValueOnce(finalProps as never).mockReturnValueOnce(finalSlots as never);

    const result = resolveFinalMountData(factoryOptions, invocation, {});

    expect(mockMerge).toHaveBeenCalledTimes(2);
    expect(mockMerge).toHaveBeenNthCalledWith(1, {
      defaultMountData: defaultMountProps,
      defaultData: defaultProps,
      mountData: mountProps,
      directData: props,
      skipDefault: false,
      skipOptions: false,
    });
    expect(mockMerge).toHaveBeenNthCalledWith(2, {
      defaultMountData: defaultMountSlots,
      defaultData: defaultSlots,
      mountData: mountSlots,
      directData: slots,
      skipDefault: false,
      skipOptions: false,
    });
    expect(result.props).toBe(finalProps);
    expect(result.slots).toBe(finalSlots);
  });

  it("uses empty data and disabled skip flags when optional inputs are omitted", () => {
    const result = resolveFinalMountData(createFactoryOptions(), {}, {});

    expect(mockMerge).toHaveBeenNthCalledWith(1, {
      defaultMountData: undefined,
      defaultData: {},
      mountData: undefined,
      directData: {},
      skipDefault: false,
      skipOptions: false,
    });
    expect(mockMerge).toHaveBeenNthCalledWith(2, {
      defaultMountData: undefined,
      defaultData: {},
      mountData: undefined,
      directData: {},
      skipDefault: false,
      skipOptions: false,
    });
    expect(result).toEqual({ props: {}, slots: {} });
  });

  it.each([
    {
      label: "skipDefaultProps",
      extraOptions: { skipDefaultProps: true },
      propsSkipped: true,
      slotsSkipped: false,
      mountOptionsSkipped: false,
    },
    {
      label: "skipDefaultSlots",
      extraOptions: { skipDefaultSlots: true },
      propsSkipped: false,
      slotsSkipped: true,
      mountOptionsSkipped: false,
    },
    {
      label: "skipDefaultOptions",
      extraOptions: { skipDefaultOptions: true },
      propsSkipped: false,
      slotsSkipped: false,
      mountOptionsSkipped: true,
    },
    {
      label: "all skip flags",
      extraOptions: {
        skipDefaultProps: true,
        skipDefaultSlots: true,
        skipDefaultOptions: true,
      },
      propsSkipped: true,
      slotsSkipped: true,
      mountOptionsSkipped: true,
    },
  ])(
    "applies $label independently",
    ({ extraOptions, propsSkipped, slotsSkipped, mountOptionsSkipped }) => {
      resolveFinalMountData(createFactoryOptions(), {}, extraOptions);

      expect(mockMerge).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          skipDefault: propsSkipped,
          skipOptions: mountOptionsSkipped,
        }),
      );
      expect(mockMerge).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          skipDefault: slotsSkipped,
          skipOptions: mountOptionsSkipped,
        }),
      );
    },
  );

  it("ignores preset selection and plugin overrides when resolving component data", () => {
    const extraOptions: ComponentFactoryExtraOptions = {
      presetKey: "admin",
      plugins: {},
      skipDefaultProps: true,
    };

    resolveFinalMountData(createFactoryOptions(), {}, extraOptions);

    expect(mockMerge).toHaveBeenCalledTimes(2);
    expect(mockMerge).toHaveBeenNthCalledWith(1, expect.objectContaining({ skipDefault: true }));
    expect(mockMerge).toHaveBeenNthCalledWith(2, expect.objectContaining({ skipDefault: false }));
  });

  it("does not mutate factory, invocation, or extra options", () => {
    const defaultProps = Object.freeze({ title: "Factory" });
    const invocationProps = Object.freeze({ title: "Mount" });
    const factoryOptions = Object.freeze({ component, defaultProps });
    const invocation = Object.freeze({ props: invocationProps });
    const extraOptions = Object.freeze({ skipDefaultProps: true });

    resolveFinalMountData(factoryOptions, invocation, extraOptions);

    expect(factoryOptions.defaultProps).toBe(defaultProps);
    expect(invocation.props).toBe(invocationProps);
    expect(extraOptions).toEqual({ skipDefaultProps: true });
  });

  it("propagates merge errors without attempting to merge slots", () => {
    const error = new Error("Props merge failed");
    mockMerge.mockImplementationOnce(() => {
      throw error;
    });

    expect(() => resolveFinalMountData(createFactoryOptions(), {}, {})).toThrow(error);
    expect(mockMerge).toHaveBeenCalledTimes(1);
  });
});
