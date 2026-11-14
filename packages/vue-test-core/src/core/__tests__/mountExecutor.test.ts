import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";

import type { FactoryOptionsResolver } from "../../types.js";
import type { FrameworkRuntimeContext } from "../types.js";

import { mergeComponentData } from "../../utils/mergeComponentData.js";
import { createPipelineContext } from "../../pipeline/core/createPipelineContext.js";
import { createPipeline } from "../../pipeline/core/createPipeline.js";
import { createMountPipeline } from "../../pipeline/mount/createMountPipeline.js";
import { validateComponentFactoryArguments } from "../../validators/validateComponentFactoryArguments.js";
import { validateComponentFactoryCreationOptions } from "../../validators/validateComponentFactoryCreationOptions.js";
import { mountWithPlugins } from "../mountWithPlugins.js";
import { executeMount } from "../mountExecutor.js";

vi.mock("../../utils/mergeComponentData.js", () => ({
  mergeComponentData: vi.fn(),
}));
vi.mock("../../pipeline/core/createPipelineContext.js", () => ({
  createPipelineContext: vi.fn(),
}));
vi.mock("../../pipeline/core/createPipeline.js", () => ({
  createPipeline: vi.fn(),
}));
vi.mock("../../pipeline/mount/createMountPipeline.js", () => ({
  createMountPipeline: vi.fn(),
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

const initialCtx = { stage: "initial" } as unknown as ReturnType<typeof createPipelineContext>;
const readyCtx = { stage: "ready" } as unknown as ReturnType<typeof createPipelineContext>;
const middleware = [] as unknown as ReturnType<typeof createMountPipeline>;
const wrapper = { mounted: true };

const mockMerge = vi.mocked(mergeComponentData);
const mockCreatePipelineContext = vi.mocked(createPipelineContext);
const mockCreatePipeline = vi.mocked(createPipeline);
const mockCreateMountPipeline = vi.mocked(createMountPipeline);
const mockValidateCreation = vi.mocked(validateComponentFactoryCreationOptions);
const mockValidateArguments = vi.mocked(validateComponentFactoryArguments);
const mockMountWithPlugins = vi.mocked(mountWithPlugins);
const mockRun = vi.fn();

const createResolver = () => vi.fn(() => ({ component: MockComponent }));

const expectNoPipelineOrMount = () => {
  expect(mockMerge).not.toHaveBeenCalled();
  expect(mockCreatePipelineContext).not.toHaveBeenCalled();
  expect(mockCreateMountPipeline).not.toHaveBeenCalled();
  expect(mockCreatePipeline).not.toHaveBeenCalled();
  expect(mockMountWithPlugins).not.toHaveBeenCalled();
};

describe("executeMount", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockMerge.mockReturnValue({} as never);
    mockCreatePipelineContext.mockReturnValue(initialCtx);
    mockCreateMountPipeline.mockReturnValue(middleware);
    mockRun.mockReturnValue(readyCtx);
    mockCreatePipeline.mockReturnValue({ run: mockRun } as never);
    mockMountWithPlugins.mockReturnValue(wrapper as never);
  });

  it("resolves a minimal mount and executes the pipeline before mounting", () => {
    const resolveOptions = createResolver();

    const result = executeMount(context, resolveOptions, {});

    expect(result).toBe(wrapper);
    expect(resolveOptions).toHaveBeenCalledTimes(1);
    expect(mockValidateCreation).toHaveBeenCalledWith(
      { component: MockComponent },
      context.presets,
    );
    expect(mockValidateArguments).toHaveBeenCalledWith({}, {}, {}, {}, context.presets);
    expect(mockMerge).toHaveBeenCalledTimes(2);
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
    expect(mockCreatePipelineContext).toHaveBeenCalledWith({
      defaultMountOptions: {},
      mountOptions: {},
      extraOptions: {},
      presets: context.presets,
    });
    expect(mockCreateMountPipeline).toHaveBeenCalledWith(initialCtx);
    expect(mockCreatePipeline).toHaveBeenCalledWith(middleware);
    expect(mockRun).toHaveBeenCalledWith(initialCtx);
    expect(mockMountWithPlugins).toHaveBeenCalledWith(
      MockComponent,
      readyCtx,
      { props: {}, slots: {} },
      { shallowByDefault: false },
    );
  });

  it("passes all props and slots layers to the merge helper and mounts the merged results", () => {
    const defaultProps = { title: "Factory default" };
    const defaultMountProps = { count: 1 };
    const mountProps = { count: 2 };
    const props = { title: "Per-mount" };
    const defaultSlots = { default: () => "Factory slot" };
    const defaultMountSlots = { footer: () => "Default mount slot" };
    const mountSlots = { footer: () => "Mount slot" };
    const slots = { default: () => "Per-mount slot" };
    const defaultMountOptions = { props: defaultMountProps, slots: defaultMountSlots };
    const mountOptions = { props: mountProps, slots: mountSlots };
    const resolveOptions = vi.fn(() => ({
      component: MockComponent,
      defaultProps,
      defaultMountOptions,
      defaultSlots,
    })) as unknown as FactoryOptionsResolver<typeof MockComponent>;
    const finalProps = { title: "Merged", count: 2 };
    const finalSlots = { default: slots.default, footer: mountSlots.footer };
    mockMerge.mockReturnValueOnce(finalProps as never).mockReturnValueOnce(finalSlots as never);

    executeMount(context, resolveOptions, {
      props,
      mountOptions: mountOptions as never,
      slots: slots as never,
    });

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
    expect(mockCreatePipelineContext).toHaveBeenCalledWith({
      defaultMountOptions,
      mountOptions,
      extraOptions: {},
      presets: context.presets,
    });
    expect(mockMountWithPlugins).toHaveBeenCalledWith(
      MockComponent,
      readyCtx,
      { props: finalProps, slots: finalSlots },
      { shallowByDefault: false },
    );
  });

  it("inherits a factory preset key without mutating the caller's extra options", () => {
    const extraOptions = { skipDefaultProps: true };
    const resolveOptions = vi.fn(() => ({ component: MockComponent, presetKey: "admin" }));

    executeMount(context, resolveOptions, { extraOptions });

    const effectiveExtra = { skipDefaultProps: true, presetKey: "admin" };
    expect(mockValidateArguments).toHaveBeenCalledWith({}, {}, {}, effectiveExtra, context.presets);
    expect(mockCreatePipelineContext).toHaveBeenCalledWith({
      defaultMountOptions: {},
      mountOptions: {},
      extraOptions: effectiveExtra,
      presets: context.presets,
    });
    expect(extraOptions).toEqual({ skipDefaultProps: true });
  });

  it("gives mount-level preset selection priority over the factory preset", () => {
    const extraOptions = { presetKey: "default", skipDefaultSlots: true };
    const resolveOptions = vi.fn(() => ({ component: MockComponent, presetKey: "admin" }));

    executeMount(context, resolveOptions, { extraOptions });

    expect(mockValidateArguments).toHaveBeenCalledWith({}, {}, {}, extraOptions, context.presets);
    expect(mockCreatePipelineContext).toHaveBeenCalledWith({
      defaultMountOptions: {},
      mountOptions: {},
      extraOptions,
      presets: context.presets,
    });
    expect(extraOptions).toEqual({ presetKey: "default", skipDefaultSlots: true });
  });

  it("forwards default-skipping controls independently for props and slots", () => {
    const resolveOptions = createResolver();

    executeMount(context, resolveOptions, {
      extraOptions: {
        skipDefaultProps: true,
        skipDefaultSlots: false,
        skipDefaultOptions: true,
      },
    });

    expect(mockMerge).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        skipDefault: true,
        skipOptions: true,
      }),
    );
    expect(mockMerge).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        skipDefault: false,
        skipOptions: true,
      }),
    );
  });

  it("uses the framework's shallow default when mounting", () => {
    const shallowContext: FrameworkRuntimeContext = {
      presets: context.presets,
      shallowByDefault: true,
    };

    executeMount(shallowContext, createResolver(), {});

    expect(mockMountWithPlugins).toHaveBeenCalledWith(MockComponent, readyCtx, expect.any(Object), {
      shallowByDefault: true,
    });
  });

  it("resolves fresh factory configuration exactly once for each mount", () => {
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
    expect(mockCreatePipelineContext).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        defaultMountOptions: firstDefaults,
      }),
    );
    expect(mockCreatePipelineContext).toHaveBeenNthCalledWith(
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
    expectNoPipelineOrMount();
  });

  it("stops before mount argument validation if the resolved factory config is invalid", () => {
    const resolveOptions = createResolver();
    const error = new Error("Invalid factory options");
    mockValidateCreation.mockImplementationOnce(() => {
      throw error;
    });

    expect(() => executeMount(context, resolveOptions, {})).toThrow(error);

    expect(resolveOptions).toHaveBeenCalledTimes(1);
    expect(mockValidateCreation).toHaveBeenCalledTimes(1);
    expect(mockValidateArguments).not.toHaveBeenCalled();
    expectNoPipelineOrMount();
  });

  it("validates mount arguments after factory resolution and before merging", () => {
    const resolveOptions = createResolver();
    const error = new Error("Invalid mount arguments");
    mockValidateArguments.mockImplementationOnce(() => {
      throw error;
    });

    expect(() => executeMount(context, resolveOptions, {})).toThrow(error);

    expect(resolveOptions).toHaveBeenCalledTimes(1);
    expect(mockValidateCreation).toHaveBeenCalledTimes(1);
    expect(mockValidateArguments).toHaveBeenCalledTimes(1);
    expect(mockValidateCreation.mock.invocationCallOrder[0]).toBeLessThan(
      mockValidateArguments.mock.invocationCallOrder[0],
    );
    expectNoPipelineOrMount();
  });

  it("propagates resolver failures without validating or mounting", () => {
    const error = new Error("Resolver failed");
    const resolveOptions = vi.fn((): { component: typeof MockComponent } => {
      throw error;
    });

    expect(() => executeMount(context, resolveOptions, {})).toThrow(error);

    expect(resolveOptions).toHaveBeenCalledTimes(1);
    expect(mockValidateCreation).not.toHaveBeenCalled();
    expect(mockValidateArguments).not.toHaveBeenCalled();
    expectNoPipelineOrMount();
  });

  it("does not mount if executing the pipeline fails", () => {
    const error = new Error("Pipeline failed");
    mockRun.mockImplementationOnce(() => {
      throw error;
    });

    expect(() => executeMount(context, createResolver(), {})).toThrow(error);

    expect(mockCreatePipeline).toHaveBeenCalledTimes(1);
    expect(mockRun).toHaveBeenCalledWith(initialCtx);
    expect(mockMountWithPlugins).not.toHaveBeenCalled();
  });
});
