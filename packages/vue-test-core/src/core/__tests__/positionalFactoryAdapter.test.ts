import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";

import type { FrameworkRuntimeContext } from "../types.js";

import { createComponentFactory } from "../componentFactory.js";
import { createPositionalComponentFactory } from "../positionalFactoryAdapter.js";

vi.mock("../componentFactory.js", () => ({
  createComponentFactory: vi.fn(),
}));

const MockComponent = defineComponent({
  name: "MockComponent",
  props: { title: String },
  render: () => null,
});

const context: FrameworkRuntimeContext = {
  presets: {
    default: { manifest: [], defaults: {} },
    admin: { manifest: [], defaults: {} },
  },
  shallowByDefault: false,
};

const returnedFactory = Object.assign(vi.fn(), { withOptions: vi.fn() });
const mockCreateComponentFactory = vi.mocked(createComponentFactory);

const getCapturedResolver = () => {
  expect(mockCreateComponentFactory).toHaveBeenCalledTimes(1);
  return mockCreateComponentFactory.mock.calls[0][1];
};

describe("createPositionalComponentFactory", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockCreateComponentFactory.mockReturnValue(returnedFactory);
  });

  it("delegates creation with the original framework context and returns the shared factory", () => {
    const factory = createPositionalComponentFactory(context, MockComponent);

    expect(factory).toBe(returnedFactory);
    expect(mockCreateComponentFactory).toHaveBeenCalledTimes(1);
    expect(mockCreateComponentFactory.mock.calls[0][0]).toBe(context);
    expect(getCapturedResolver()).toEqual(expect.any(Function));
  });

  it("returns only the component when optional resolvers and preset selection are omitted", () => {
    createPositionalComponentFactory(context, MockComponent);

    const resolveOptions = getCapturedResolver();

    expect(resolveOptions()).toEqual({ component: MockComponent });
    expect(resolveOptions()).toEqual({ component: MockComponent });
  });

  it("does not evaluate default resolvers until the captured options resolver is invoked", () => {
    const defaultProps = vi.fn(() => ({ title: "Default" }));
    const defaultMountOptions = vi.fn(() => ({ shallow: true }));
    const defaultSlots = vi.fn(() => ({}));

    createPositionalComponentFactory(
      context,
      MockComponent,
      defaultProps,
      defaultMountOptions,
      defaultSlots,
    );

    expect(defaultProps).not.toHaveBeenCalled();
    expect(defaultMountOptions).not.toHaveBeenCalled();
    expect(defaultSlots).not.toHaveBeenCalled();

    const resolved = getCapturedResolver()();

    expect(resolved).toEqual({
      component: MockComponent,
      defaultProps: { title: "Default" },
      defaultMountOptions: { shallow: true },
      defaultSlots: {},
    });
    expect(defaultProps).toHaveBeenCalledTimes(1);
    expect(defaultMountOptions).toHaveBeenCalledTimes(1);
    expect(defaultSlots).toHaveBeenCalledTimes(1);
  });

  it("evaluates each provided default resolver exactly once per resolution", () => {
    const defaultProps = vi.fn(() => ({ title: "Default" }));
    const defaultMountOptions = vi.fn(() => ({
      global: { stubs: { AppButton: true } },
    }));
    const defaultSlots = vi.fn(() => ({}));

    createPositionalComponentFactory(
      context,
      MockComponent,
      defaultProps,
      defaultMountOptions,
      defaultSlots,
    );

    const resolveOptions = getCapturedResolver();
    const first = resolveOptions();
    const second = resolveOptions();

    expect(defaultProps).toHaveBeenCalledTimes(2);
    expect(defaultMountOptions).toHaveBeenCalledTimes(2);
    expect(defaultSlots).toHaveBeenCalledTimes(2);
    expect(first).not.toBe(second);
    expect(first.defaultProps).not.toBe(second.defaultProps);
    expect(first.defaultMountOptions).not.toBe(second.defaultMountOptions);
    expect(first.defaultSlots).not.toBe(second.defaultSlots);
    expect(first.defaultMountOptions?.global?.stubs).not.toBe(
      second.defaultMountOptions?.global?.stubs,
    );
  });

  it("includes only the default fields whose resolvers were supplied", () => {
    const defaultMountOptions = vi.fn(() => ({ shallow: true }));

    createPositionalComponentFactory(context, MockComponent, undefined, defaultMountOptions);

    const resolved = getCapturedResolver()();

    expect(resolved).toEqual({
      component: MockComponent,
      defaultMountOptions: { shallow: true },
    });
    expect(resolved).not.toHaveProperty("defaultProps");
    expect(resolved).not.toHaveProperty("defaultSlots");
    expect(resolved).not.toHaveProperty("presetKey");
  });

  it("captures the validated factory-level preset key without retaining a mutable config reference", () => {
    const config = { presetKey: "admin" };

    createPositionalComponentFactory(
      context,
      MockComponent,
      undefined,
      undefined,
      undefined,
      config,
    );

    config.presetKey = "default";

    expect(getCapturedResolver()()).toEqual({ component: MockComponent, presetKey: "admin" });
    expect(config).toEqual({ presetKey: "default" });
  });

  it("rejects an invalid component before delegating factory creation", () => {
    expect(() =>
      createPositionalComponentFactory(context, null as unknown as typeof MockComponent),
    ).toThrow();

    expect(mockCreateComponentFactory).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: "defaultProps",
      create: () => createPositionalComponentFactory(context, MockComponent, 42 as never),
    },
    {
      name: "defaultMountOptions",
      create: () =>
        createPositionalComponentFactory(context, MockComponent, undefined, {} as never),
    },
    {
      name: "defaultSlots",
      create: () =>
        createPositionalComponentFactory(
          context,
          MockComponent,
          undefined,
          undefined,
          null as never,
        ),
    },
  ])("rejects a non-function $name resolver at factory creation", ({ create }) => {
    expect(create).toThrow();
    expect(mockCreateComponentFactory).not.toHaveBeenCalled();
  });

  it("rejects an unknown preset key at factory creation", () => {
    expect(() =>
      createPositionalComponentFactory(context, MockComponent, undefined, undefined, undefined, {
        presetKey: "missing",
      }),
    ).toThrow();

    expect(mockCreateComponentFactory).not.toHaveBeenCalled();
  });
});
