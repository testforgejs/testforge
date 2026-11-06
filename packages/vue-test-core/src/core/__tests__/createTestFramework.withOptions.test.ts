import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import type { SlotsType } from "vue";

import type {
  ComponentFactory,
  ComponentFactoryExtraOptions,
  ComponentFactoryInvocationOptions,
  TestFrameworkPresets,
} from "../../types.js";
import { createTestFramework } from "../createTestFramework.js";
import { mountWithPlugins } from "../mountWithPlugins.js";

// Mock only the final VTU boundary; the factory validators, preset resolution,
// and mount pipeline run normally in both invocation forms.
vi.mock("../mountWithPlugins.js", () => ({
  mountWithPlugins: vi.fn(),
}));

const mockMountWithPlugins = vi.mocked(mountWithPlugins);

const TestComponent = defineComponent({
  name: "TestComponent",
  props: {
    title: String,
    count: Number,
  },
  slots: Object as SlotsType<{
    default: () => string;
    footer: () => string;
  }>,
  render: () => null,
});

type TestFactory = ComponentFactory<typeof TestComponent>;
type InvocationOptions = ComponentFactoryInvocationOptions<typeof TestComponent>;

const presets = {
  default: { manifest: [], defaults: {} },
  alternative: { manifest: [], defaults: {} },
} satisfies TestFrameworkPresets;

function createFactory(): TestFactory {
  return createTestFramework({ presets }).testComponentFactory(TestComponent);
}

/*
 * Exercise the real factory twice and compare all values handed to mounting.
 * The shared mock result is sufficient for comparing the invocation adapters;
 * separate tests verify that each API forwards its own mount result.
 */
function expectEquivalentMounts(factory: TestFactory, options: InvocationOptions) {
  const { props, mountOptions, slots, extraOptions } = options;

  const positionalWrapper = factory(props, mountOptions, slots, extraOptions);
  const objectWrapper = factory.withOptions(options);

  expect(mockMountWithPlugins).toHaveBeenCalledTimes(2);

  const positionalCall = mockMountWithPlugins.mock.calls[0]!;
  const objectCall = mockMountWithPlugins.mock.calls[1]!;

  expect(objectCall).toEqual(positionalCall);
  expect(objectWrapper).toBe(positionalWrapper);

  return positionalCall;
}

describe("createTestFramework - factory API equivalence", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Only equality of the returned wrapper matters to this adapter test.
    mockMountWithPlugins.mockReturnValue({
      unmount: vi.fn(),
    } as unknown as ReturnType<typeof mountWithPlugins>);
  });

  describe("Mount invocation equivalence", () => {
    it("mounts equivalently when all arguments are omitted", () => {
      const factory = createFactory();

      const positionalWrapper = factory();
      const objectWrapper = factory.withOptions({});

      expect(mockMountWithPlugins).toHaveBeenCalledTimes(2);
      expect(mockMountWithPlugins.mock.calls[1]).toEqual(mockMountWithPlugins.mock.calls[0]);
      expect(objectWrapper).toBe(positionalWrapper);
    });

    it("accepts explicitly undefined fields as omitted positional arguments", () => {
      expectEquivalentMounts(createFactory(), {
        props: undefined,
        mountOptions: undefined,
        slots: undefined,
        extraOptions: undefined,
      });
    });

    it("mounts equivalently with only props", () => {
      const call = expectEquivalentMounts(createFactory(), {
        props: { title: "Per-test title", count: 2 },
      });

      expect(call[2]?.props).toEqual({ title: "Per-test title", count: 2 });
    });

    it("mounts equivalently with only mountOptions", () => {
      const call = expectEquivalentMounts(createFactory(), {
        mountOptions: { shallow: true, attrs: { "data-test": "example" } },
      });

      expect(call[1].result.mountOptions).toMatchObject({
        shallow: true,
        attrs: { "data-test": "example" },
      });
    });

    it("mounts equivalently with only slots", () => {
      const defaultSlot = () => "Per-test slot";
      const call = expectEquivalentMounts(createFactory(), {
        slots: { default: defaultSlot },
      });

      expect(call[2]).toMatchObject({
        slots: {
          default: defaultSlot,
        },
      });
    });

    it("mounts equivalently with only extraOptions (the fourth positional argument)", () => {
      const call = expectEquivalentMounts(createFactory(), {
        extraOptions: { presetKey: "alternative" },
      });

      expect(call[1].preset).toBe(presets.alternative);
      expect(call[1].extraOptions.presetKey).toBe("alternative");
    });

    it("mounts equivalently with all four arguments and resolves overrides", () => {
      const defaultSlot = () => "From direct slots";
      const call = expectEquivalentMounts(createFactory(), {
        props: { title: "direct" },
        mountOptions: {
          shallow: true,
          props: { title: "mount", count: 3 },
          slots: { default: () => "From mountOptions" },
        },
        slots: { default: defaultSlot },
        extraOptions: { presetKey: "alternative", skipDefaultProps: true },
      });

      expect(call[2]?.props).toEqual({ title: "direct", count: 3 });
      expect(call[2]).toMatchObject({
        slots: {
          default: defaultSlot,
        },
      });
      expect(call[1].preset).toBe(presets.alternative);
    });
  });

  describe("Mount invocation interoperability", () => {
    it("forwards each mount's distinct wrapper through both invocation APIs", () => {
      const factory = createFactory();

      const positionalWrapper = {
        unmount: vi.fn(),
      } as unknown as ReturnType<typeof mountWithPlugins>;
      const objectWrapper = {
        unmount: vi.fn(),
      } as unknown as ReturnType<typeof mountWithPlugins>;

      mockMountWithPlugins
        .mockReturnValueOnce(positionalWrapper)
        .mockReturnValueOnce(objectWrapper);

      expect(factory()).toBe(positionalWrapper);
      expect(factory.withOptions({})).toBe(objectWrapper);
      expect(mockMountWithPlugins).toHaveBeenCalledTimes(2);
    });

    it("supports alternating between object and positional mount invocations", () => {
      const factory = createFactory();

      factory.withOptions({ props: { title: "first" } });
      factory({ title: "second" });
      factory.withOptions({ props: { title: "third" } });

      expect(mockMountWithPlugins).toHaveBeenCalledTimes(3);
      expect(mockMountWithPlugins.mock.calls.map((call) => call[2]?.props)).toEqual([
        { title: "first" },
        { title: "second" },
        { title: "third" },
      ]);
    });
  });

  describe("Factory creation API equivalence", () => {
    it("produces equivalent mounts for all four creation and invocation API combinations", () => {
      const { testComponentFactory } = createTestFramework({ presets });
      const defaultSlot = () => "Factory slot";
      const footerSlot = () => "Per-mount footer";

      const positionalFactory = testComponentFactory(
        TestComponent,
        () => ({ title: "factory" }),
        () => ({
          props: { count: 1 },
          attrs: { "data-source": "factory" },
        }),
        () => ({ default: defaultSlot }),
        { presetKey: "alternative" },
      );

      const objectFactory = testComponentFactory.withOptions(() => ({
        component: TestComponent,
        defaultProps: { title: "factory" },
        defaultMountOptions: {
          props: { count: 1 },
          attrs: { "data-source": "factory" },
        },
        defaultSlots: { default: defaultSlot },
        presetKey: "alternative",
      }));

      const options: InvocationOptions = {
        props: { title: "per-mount" },
        mountOptions: { props: { count: 2 } },
        slots: { footer: footerSlot },
      };
      const { props, mountOptions, slots, extraOptions } = options;

      positionalFactory(props, mountOptions, slots, extraOptions);
      positionalFactory.withOptions(options);
      objectFactory(props, mountOptions, slots, extraOptions);
      objectFactory.withOptions(options);

      expect(mockMountWithPlugins).toHaveBeenCalledTimes(4);

      const calls = mockMountWithPlugins.mock.calls;
      const expectedCall = calls[0]!;

      for (const call of calls.slice(1)) {
        expect(call).toEqual(expectedCall);
      }

      expect(expectedCall[1].preset).toBe(presets.alternative);
      expect(expectedCall[2]?.props).toEqual({ title: "per-mount", count: 2 });
      expect(expectedCall[2]?.slots).toEqual({
        default: defaultSlot,
        footer: footerSlot,
      });
      expect(expectedCall[1].result.mountOptions.attrs).toEqual({
        "data-source": "factory",
      });
    });
  });

  describe("Configuration and resolution equivalence", () => {
    it("preserves factory defaults and per-mount prop/slot merging", () => {
      const factoryDefaultSlot = () => "Factory slot";
      const perMountSlot = () => "Mount slot";
      const factory = createTestFramework({ presets }).testComponentFactory.withOptions(() => ({
        component: TestComponent,
        defaultProps: { title: "factory" },
        defaultMountOptions: {
          props: { count: 1 },
          slots: { footer: factoryDefaultSlot },
        },
        defaultSlots: { default: factoryDefaultSlot },
      }));

      const call = expectEquivalentMounts(factory, {
        props: { title: "direct" },
        mountOptions: { props: { count: 2 } },
        slots: { default: perMountSlot },
      });

      expect(call[2]?.props).toEqual({ title: "direct", count: 2 });
      expect(call[2]?.slots).toEqual({ default: perMountSlot, footer: factoryDefaultSlot });
    });

    it("respects default-skipping flags identically", () => {
      const factory = createTestFramework({ presets }).testComponentFactory.withOptions(() => ({
        component: TestComponent,
        defaultProps: { title: "default" },
        defaultMountOptions: { props: { count: 1 }, attrs: { id: "factory" } },
        defaultSlots: { default: () => "default slot" },
      }));

      const call = expectEquivalentMounts(factory, {
        extraOptions: {
          skipDefaultProps: true,
          skipDefaultSlots: true,
          skipDefaultOptions: true,
        },
      });

      expect(call[2]?.props).toEqual({});
      expect(call[2]?.slots).toEqual({});
      expect(call[1].result.mountOptions.attrs).toBeUndefined();
    });

    it("uses a factory-level preset when the mount does not override it", () => {
      const factory = createTestFramework({ presets }).testComponentFactory.withOptions(() => ({
        component: TestComponent,
        presetKey: "alternative",
      }));

      const call = expectEquivalentMounts(factory, { props: { title: "Test" } });

      expect(call[1].preset).toBe(presets.alternative);
    });

    it("uses the mount-level preset instead of the factory-level preset", () => {
      const factory = createTestFramework({ presets }).testComponentFactory.withOptions(() => ({
        component: TestComponent,
        presetKey: "default",
      }));

      const call = expectEquivalentMounts(factory, {
        extraOptions: { presetKey: "alternative" },
      });

      expect(call[1].preset).toBe(presets.alternative);
    });

    it("preserves both managed-plugin configuration layers", () => {
      const installedPlugin = { install: () => {} };
      const demoPlugin = {
        getName: () => "demo",
        getDefinition: () => ({ create: () => installedPlugin }),
      };
      const pluginPresets = {
        default: {
          manifest: [{ module: demoPlugin, enabled: true }],
          defaults: { demo: () => ({ source: "preset", retained: true }) },
        },
      } satisfies TestFrameworkPresets;

      const factory = createTestFramework({ presets: pluginPresets }).testComponentFactory(
        TestComponent,
      );

      // The mock plugin is deliberately not registered in PluginOptionsMap.
      // Cast only the two plugin option inputs, not the public factory API.
      const mountOptions = {
        plugins: { demo: { source: "mount", mountOnly: true } },
      } as unknown as NonNullable<InvocationOptions["mountOptions"]>;
      const extraOptions = {
        plugins: { demo: { source: "extra", extraOnly: true } },
      } as unknown as ComponentFactoryExtraOptions;

      const call = expectEquivalentMounts(factory, { mountOptions, extraOptions });

      expect(call[1].result.plugins.demo).toMatchObject({
        source: "extra",
        retained: true,
        mountOnly: true,
        extraOnly: true,
      });
    });
  });

  describe("Input integrity and validation", () => {
    it("does not mutate the caller's invocation options", () => {
      const options: InvocationOptions = {
        props: { title: "unchanged" },
        mountOptions: {
          props: { count: 1 },
          attrs: { "data-test": "unchanged" },
        },
        extraOptions: { presetKey: "alternative" },
      };
      const snapshot = structuredClone(options);

      expectEquivalentMounts(createFactory(), options);

      expect(options).toEqual(snapshot);
    });

    it("rejects unknown top-level fields before mounting", () => {
      const factory = createFactory();

      expect(() =>
        factory.withOptions({ presetKey: "alternative" } as unknown as InvocationOptions),
      ).toThrow(/Unknown option "presetKey" in "options"/);
      expect(mockMountWithPlugins).not.toHaveBeenCalled();
    });

    it("rejects invalid nested arguments through the existing positional validators", () => {
      const factory = createFactory();
      const invalidExtraOptions = null as unknown as ComponentFactoryExtraOptions;

      expect(() => factory({}, {}, {}, invalidExtraOptions)).toThrow();
      expect(() => factory.withOptions({ extraOptions: invalidExtraOptions })).toThrow();
      expect(mockMountWithPlugins).not.toHaveBeenCalled();
    });
  });
});
