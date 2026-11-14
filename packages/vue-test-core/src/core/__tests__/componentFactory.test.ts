import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";

import type { ComponentFactoryInvocationOptions, FactoryOptionsResolver } from "../../types.js";
import type { FrameworkRuntimeContext } from "../types.js";

import { createComponentFactory } from "../componentFactory.js";
import { executeMount } from "../mountExecutor.js";

vi.mock("../mountExecutor.js", () => ({
  executeMount: vi.fn(),
}));

const MockComponent = defineComponent({
  name: "MockComponent",
  props: { title: String },
  render: () => null,
});

const context: FrameworkRuntimeContext = {
  presets: {},
  shallowByDefault: false,
};

const mountedWrapper = { mounted: true } as unknown as ReturnType<typeof executeMount>;
const mockExecuteMount = vi.mocked(executeMount);
const createResolver = () => vi.fn(() => ({ component: MockComponent }));

describe("createComponentFactory", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockExecuteMount.mockReturnValue(mountedWrapper);
  });

  it.each([undefined, null, {}, 42])("rejects a non-function resolver: %s", (value) => {
    expect(() =>
      createComponentFactory(
        context,
        value as unknown as FactoryOptionsResolver<typeof MockComponent>,
      ),
    ).toThrow(TypeError);

    expect(() =>
      createComponentFactory(
        context,
        value as unknown as FactoryOptionsResolver<typeof MockComponent>,
      ),
    ).toThrow("Factory options resolver must be a function.");

    expect(mockExecuteMount).not.toHaveBeenCalled();
  });

  it("creates a callable factory without evaluating the resolver or mounting", () => {
    const resolveOptions = createResolver();

    const factory = createComponentFactory(context, resolveOptions);

    expect(typeof factory).toBe("function");
    expect(typeof factory.withOptions).toBe("function");
    expect(resolveOptions).not.toHaveBeenCalled();
    expect(mockExecuteMount).not.toHaveBeenCalled();
  });

  it("supplies empty mount arguments when the positional call omits them", () => {
    const resolveOptions = createResolver();
    const factory = createComponentFactory(context, resolveOptions);

    const result = factory();

    expect(result).toBe(mountedWrapper);
    expect(mockExecuteMount).toHaveBeenCalledTimes(1);
    expect(mockExecuteMount).toHaveBeenCalledWith(context, resolveOptions, {
      props: {},
      mountOptions: {},
      slots: {},
      extraOptions: {},
    });
  });

  it("forwards positional mount arguments without modifying their references", () => {
    const resolveOptions = createResolver();
    const factory = createComponentFactory(context, resolveOptions);
    const props = { title: "Custom title" };
    const mountOptions = { shallow: true };
    const slots = {};
    const extraOptions = { skipDefaultProps: true };

    factory(props, mountOptions, slots, extraOptions);

    expect(mockExecuteMount).toHaveBeenCalledTimes(1);
    expect(mockExecuteMount).toHaveBeenCalledWith(context, resolveOptions, {
      props,
      mountOptions,
      slots,
      extraOptions,
    });

    const invocation = mockExecuteMount.mock.calls[0][2];
    expect(invocation.props).toBe(props);
    expect(invocation.mountOptions).toBe(mountOptions);
    expect(invocation.slots).toBe(slots);
    expect(invocation.extraOptions).toBe(extraOptions);
  });

  it("maps named invocation arguments to the same executor inputs as positional calls", () => {
    const resolveOptions = createResolver();
    const factory = createComponentFactory(context, resolveOptions);
    const props = { title: "Custom title" };
    const mountOptions = { shallow: true };
    const slots = {};
    const extraOptions = { skipDefaultSlots: true };
    const options = { props, mountOptions, slots, extraOptions };

    const positionalResult = factory(props, mountOptions, slots, extraOptions);
    const namedResult = factory.withOptions(options);

    expect(positionalResult).toBe(mountedWrapper);
    expect(namedResult).toBe(mountedWrapper);
    expect(mockExecuteMount).toHaveBeenCalledTimes(2);
    expect(mockExecuteMount.mock.calls[0]).toEqual(mockExecuteMount.mock.calls[1]);
    expect(mockExecuteMount.mock.calls[1][2]).toEqual(options);
  });

  it("uses the positional defaults for omitted named invocation fields", () => {
    const resolveOptions = createResolver();
    const factory = createComponentFactory(context, resolveOptions);
    const props = { title: "Only props" };
    const options = { props };

    factory.withOptions(options);

    expect(mockExecuteMount).toHaveBeenCalledTimes(1);
    expect(mockExecuteMount).toHaveBeenCalledWith(context, resolveOptions, {
      props,
      mountOptions: {},
      slots: {},
      extraOptions: {},
    });
    expect(options).toEqual({ props });
  });

  it("accepts an empty named invocation and forwards default mount arguments", () => {
    const resolveOptions = createResolver();
    const factory = createComponentFactory(context, resolveOptions);

    factory.withOptions({});

    expect(mockExecuteMount).toHaveBeenCalledTimes(1);
    expect(mockExecuteMount).toHaveBeenCalledWith(context, resolveOptions, {
      props: {},
      mountOptions: {},
      slots: {},
      extraOptions: {},
    });
  });

  it.each([
    { label: "undefined", value: undefined, error: '"options" must be a plain object.' },
    { label: "null", value: null, error: '"options" must be a plain object.' },
    { label: "array", value: [], error: '"options" must be a plain object.' },
    {
      label: "unknown top-level key",
      value: { presetKey: "default" },
      error: 'Unknown option "presetKey" in "options".',
    },
  ])("rejects $label named invocation before reaching the executor", ({ value, error }) => {
    const resolveOptions = createResolver();
    const factory = createComponentFactory(context, resolveOptions);

    expect(() =>
      factory.withOptions(
        value as unknown as ComponentFactoryInvocationOptions<typeof MockComponent>,
      ),
    ).toThrow(error);

    expect(mockExecuteMount).not.toHaveBeenCalled();
    expect(resolveOptions).not.toHaveBeenCalled();
  });

  it("passes the context and resolver belonging to each factory", () => {
    const firstContext: FrameworkRuntimeContext = { presets: {}, shallowByDefault: false };
    const secondContext: FrameworkRuntimeContext = { presets: {}, shallowByDefault: true };
    const firstResolver = createResolver();
    const secondResolver = createResolver();
    const firstFactory = createComponentFactory(firstContext, firstResolver);
    const secondFactory = createComponentFactory(secondContext, secondResolver);

    firstFactory();
    secondFactory.withOptions({});

    expect(mockExecuteMount.mock.calls[0][0]).toBe(firstContext);
    expect(mockExecuteMount.mock.calls[0][1]).toBe(firstResolver);
    expect(mockExecuteMount.mock.calls[1][0]).toBe(secondContext);
    expect(mockExecuteMount.mock.calls[1][1]).toBe(secondResolver);
  });
});
