import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";

import type { ComponentFactoryInvocationOptions, FactoryOptionsResolver } from "../../types.js";
import type { FrameworkRuntimeContext } from "../types.js";

import { executeMountPipeline } from "../../pipeline/mount/executeMountPipeline.js";
import { validateComponentFactoryArguments } from "../../validators/validateComponentFactoryArguments.js";
import { validateComponentFactoryCreationOptions } from "../../validators/validateComponentFactoryCreationOptions.js";
import { mountWithPlugins } from "../mountWithPlugins.js";
import { resolveFinalMountData } from "../utils/resolveFinalMountData.js";
import { executeMount } from "../mountExecutor.js";

vi.mock("../../pipeline/mount/executeMountPipeline.js", () => ({
  executeMountPipeline: vi.fn(),
}));
vi.mock("../utils/resolveFinalMountData.js", () => ({
  resolveFinalMountData: vi.fn(),
}));
vi.mock("../../validators/validateComponentFactoryArguments.js", () => ({
  validateComponentFactoryArguments: vi.fn(),
}));
vi.mock("../../validators/validateComponentFactoryCreationOptions.js", () => ({
  validateComponentFactoryCreationOptions: vi.fn(),
}));
vi.mock("../mountWithPlugins.js", () => ({
  mountWithPlugins: vi.fn(),
}));

const MockComponent = defineComponent({
  name: "MockComponent",
  props: { title: String, count: Number },
  render: () => null,
});

const context: FrameworkRuntimeContext = {
  presets: {
    default: { manifest: [], defaults: {} },
    admin: { manifest: [], defaults: {} },
  },
  shallowByDefault: false,
};

const readyCtx = { stage: "ready" } as unknown as ReturnType<typeof executeMountPipeline>;
const finalMountData = { props: { title: "Resolved" }, slots: {} };
const wrapper = { mounted: true };

const mockResolveFinalMountData = vi.mocked(resolveFinalMountData);
const mockExecuteMountPipeline = vi.mocked(executeMountPipeline);
const mockValidateCreation = vi.mocked(validateComponentFactoryCreationOptions);
const mockValidateArguments = vi.mocked(validateComponentFactoryArguments);
const mockMountWithPlugins = vi.mocked(mountWithPlugins);

const createResolver = () => vi.fn(() => ({ component: MockComponent }));

const expectNoPreparationOrMount = () => {
  expect(mockResolveFinalMountData).not.toHaveBeenCalled();
  expect(mockExecuteMountPipeline).not.toHaveBeenCalled();
  expect(mockMountWithPlugins).not.toHaveBeenCalled();
};

describe("executeMount", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockResolveFinalMountData.mockReturnValue(finalMountData as never);
    mockExecuteMountPipeline.mockReturnValue(readyCtx);
    mockMountWithPlugins.mockReturnValue(wrapper as never);
  });

  it("resolves configuration and delegates data preparation and pipeline execution before mounting", () => {
    const resolveOptions = createResolver();
    const invocation = {};

    const result = executeMount(context, resolveOptions, invocation);

    expect(result).toBe(wrapper);
    expect(resolveOptions).toHaveBeenCalledTimes(1);
    expect(mockValidateCreation).toHaveBeenCalledWith(
      { component: MockComponent },
      context.presets,
    );
    expect(mockValidateArguments).toHaveBeenCalledWith({}, {}, {}, {}, context.presets);
    expect(mockResolveFinalMountData).toHaveBeenCalledWith(
      { component: MockComponent },
      invocation,
      {},
    );
    expect(mockExecuteMountPipeline).toHaveBeenCalledWith({
      defaultMountOptions: {},
      mountOptions: {},
      extraOptions: {},
      presets: context.presets,
    });
    expect(mockMountWithPlugins).toHaveBeenCalledWith(MockComponent, readyCtx, finalMountData, {
      shallowByDefault: false,
    });
    expect(mockResolveFinalMountData.mock.invocationCallOrder[0]).toBeLessThan(
      mockExecuteMountPipeline.mock.invocationCallOrder[0],
    );
    expect(mockExecuteMountPipeline.mock.invocationCallOrder[0]).toBeLessThan(
      mockMountWithPlugins.mock.invocationCallOrder[0],
    );
  });

  it("passes the resolved factory configuration and invocation unchanged to data preparation", () => {
    const defaultProps = { title: "Factory default" };
    const defaultMountOptions = { props: { count: 1 } };
    const defaultSlots = { default: () => "Factory slot" };
    const factoryOptions = {
      component: MockComponent,
      defaultProps,
      defaultMountOptions,
      defaultSlots,
    };
    const resolveOptions = vi.fn(() => factoryOptions) as unknown as FactoryOptionsResolver<
      typeof MockComponent
    >;
    const invocation = {
      props: { title: "Per mount" },
      mountOptions: { props: { count: 2 } },
      slots: { default: () => "Mount slot" },
    } as unknown as ComponentFactoryInvocationOptions<typeof MockComponent>;

    executeMount(context, resolveOptions, invocation);

    expect(mockResolveFinalMountData).toHaveBeenCalledWith(factoryOptions, invocation, {});
    expect(mockResolveFinalMountData.mock.calls[0][0]).toBe(factoryOptions);
    expect(mockResolveFinalMountData.mock.calls[0][1]).toBe(invocation);
    expect(mockExecuteMountPipeline).toHaveBeenCalledWith({
      defaultMountOptions,
      mountOptions: invocation.mountOptions,
      extraOptions: {},
      presets: context.presets,
    });
    expect(mockMountWithPlugins).toHaveBeenCalledWith(MockComponent, readyCtx, finalMountData, {
      shallowByDefault: false,
    });
  });

  it("inherits the factory preset without mutating mount extra options", () => {
    const extraOptions = { skipDefaultProps: true };
    const invocation = { extraOptions };
    const factoryOptions = { component: MockComponent, presetKey: "admin" };
    const resolveOptions = vi.fn(() => factoryOptions);
    const effectiveExtra = { skipDefaultProps: true, presetKey: "admin" };

    executeMount(context, resolveOptions, invocation);

    expect(mockValidateArguments).toHaveBeenCalledWith({}, {}, {}, effectiveExtra, context.presets);
    expect(mockResolveFinalMountData).toHaveBeenCalledWith(
      factoryOptions,
      invocation,
      effectiveExtra,
    );
    expect(mockExecuteMountPipeline).toHaveBeenCalledWith({
      defaultMountOptions: {},
      mountOptions: {},
      extraOptions: effectiveExtra,
      presets: context.presets,
    });
    expect(extraOptions).toEqual({ skipDefaultProps: true });
  });

  it("gives mount-level preset selection priority over the factory preset", () => {
    const extraOptions = { presetKey: "default", skipDefaultSlots: true };
    const invocation = { extraOptions };
    const factoryOptions = { component: MockComponent, presetKey: "admin" };

    executeMount(context, () => factoryOptions, invocation);

    expect(mockValidateArguments).toHaveBeenCalledWith({}, {}, {}, extraOptions, context.presets);
    expect(mockResolveFinalMountData).toHaveBeenCalledWith(
      factoryOptions,
      invocation,
      extraOptions,
    );
    expect(mockExecuteMountPipeline).toHaveBeenCalledWith({
      defaultMountOptions: {},
      mountOptions: {},
      extraOptions,
      presets: context.presets,
    });
  });

  it("forwards all default-skipping controls to data resolution", () => {
    const invocation = {
      extraOptions: {
        skipDefaultProps: true,
        skipDefaultSlots: false,
        skipDefaultOptions: true,
      },
    };
    const factoryOptions = { component: MockComponent };

    executeMount(context, () => factoryOptions, invocation);

    expect(mockResolveFinalMountData).toHaveBeenCalledWith(
      factoryOptions,
      invocation,
      invocation.extraOptions,
    );
  });

  it("uses the framework shallow default when mounting", () => {
    const shallowContext: FrameworkRuntimeContext = {
      presets: context.presets,
      shallowByDefault: true,
    };

    executeMount(shallowContext, createResolver(), {});

    expect(mockMountWithPlugins).toHaveBeenCalledWith(MockComponent, readyCtx, finalMountData, {
      shallowByDefault: true,
    });
  });

  it("resolves fresh factory configuration exactly once for every mount", () => {
    const firstDefaults = { props: { count: 1 } };
    const secondDefaults = { props: { count: 2 } };
    const resolveOptions = vi
      .fn()
      .mockReturnValueOnce({ component: MockComponent, defaultMountOptions: firstDefaults })
      .mockReturnValueOnce({ component: MockComponent, defaultMountOptions: secondDefaults });

    executeMount(context, resolveOptions, {});
    executeMount(context, resolveOptions, {});

    expect(resolveOptions).toHaveBeenCalledTimes(2);
    expect(mockValidateCreation).toHaveBeenCalledTimes(2);
    expect(mockResolveFinalMountData).toHaveBeenCalledTimes(2);
    expect(mockExecuteMountPipeline).toHaveBeenCalledTimes(2);
    expect(mockExecuteMountPipeline).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        defaultMountOptions: firstDefaults,
      }),
    );
    expect(mockExecuteMountPipeline).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        defaultMountOptions: secondDefaults,
      }),
    );
    expect(firstDefaults.props).toEqual({ count: 1 });
    expect(secondDefaults.props).toEqual({ count: 2 });
    expect(mockMountWithPlugins).toHaveBeenCalledTimes(2);
  });

  it.each([
    { label: "null", value: null },
    { label: "array", value: [] },
    { label: "string", value: "invalid" },
  ])("rejects $label extraOptions before invoking the factory resolver", ({ value }) => {
    const resolveOptions = createResolver();

    expect(() =>
      executeMount(context, resolveOptions, {
        extraOptions: value as never,
      }),
    ).toThrow('"extraOptions" must be a plain object.');

    expect(resolveOptions).not.toHaveBeenCalled();
    expect(mockValidateCreation).not.toHaveBeenCalled();
    expect(mockValidateArguments).not.toHaveBeenCalled();
    expectNoPreparationOrMount();
  });

  it("stops before validating mount arguments if resolved factory config is invalid", () => {
    const resolveOptions = createResolver();
    const error = new Error("Invalid factory options");
    mockValidateCreation.mockImplementationOnce(() => {
      throw error;
    });

    expect(() => executeMount(context, resolveOptions, {})).toThrow(error);

    expect(resolveOptions).toHaveBeenCalledTimes(1);
    expect(mockValidateArguments).not.toHaveBeenCalled();
    expectNoPreparationOrMount();
  });

  it("validates mount arguments before preparing data or executing the pipeline", () => {
    const resolveOptions = createResolver();
    const error = new Error("Invalid mount arguments");
    mockValidateArguments.mockImplementationOnce(() => {
      throw error;
    });

    expect(() => executeMount(context, resolveOptions, {})).toThrow(error);

    expect(mockValidateCreation.mock.invocationCallOrder[0]).toBeLessThan(
      mockValidateArguments.mock.invocationCallOrder[0],
    );
    expectNoPreparationOrMount();
  });

  it("propagates resolver failures without validating or mounting", () => {
    const error = new Error("Resolver failed");
    const resolveOptions = vi.fn((): { component: typeof MockComponent } => {
      throw error;
    });

    expect(() => executeMount(context, resolveOptions, {})).toThrow(error);

    expect(mockValidateCreation).not.toHaveBeenCalled();
    expect(mockValidateArguments).not.toHaveBeenCalled();
    expectNoPreparationOrMount();
  });

  it("does not execute the pipeline if final mount data resolution fails", () => {
    const error = new Error("Data resolution failed");
    mockResolveFinalMountData.mockImplementationOnce(() => {
      throw error;
    });

    expect(() => executeMount(context, createResolver(), {})).toThrow(error);

    expect(mockExecuteMountPipeline).not.toHaveBeenCalled();
    expect(mockMountWithPlugins).not.toHaveBeenCalled();
  });

  it("does not mount if executing the pipeline fails", () => {
    const error = new Error("Pipeline failed");
    mockExecuteMountPipeline.mockImplementationOnce(() => {
      throw error;
    });

    expect(() => executeMount(context, createResolver(), {})).toThrow(error);

    expect(mockExecuteMountPipeline).toHaveBeenCalledTimes(1);
    expect(mockMountWithPlugins).not.toHaveBeenCalled();
  });
});
