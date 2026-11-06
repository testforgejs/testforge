const runner = typeof vi !== "undefined" ? vi : jest;

describe("testComponentFactory Integration (Universal)", () => {
  const MockComponent = { name: "MockComponent", render: () => null };

  let mockMount;
  let mockShallowMount;
  let testComponentFactory;

  let createTestFramework;

  const createFactory = async () => {
    const { presets } = await import("./utils/presets/mockPresets.js");

    return createTestFramework({
      presets,
    }).testComponentFactory;
  };

  const createFactoryWithShallowDefault = async (shallowByDefault) => {
    const { presets } = await import("./utils/presets/mockPresets.js");

    return createTestFramework({
      presets,
      shallowByDefault,
    }).testComponentFactory;
  };

  // Applies the same per-mount defaults resolvers through either factory creation API.
  // This helper does not clone returned values: isolation remains the resolver's responsibility.
  const createFactoryFromResolvers = (
    creationApi,
    { defaultProps, defaultMountOptions, defaultSlots } = {},
  ) => {
    if (creationApi === "positional") {
      return testComponentFactory(MockComponent, defaultProps, defaultMountOptions, defaultSlots);
    }

    return testComponentFactory.withOptions(() => {
      const options = { component: MockComponent };

      if (defaultProps) options.defaultProps = defaultProps();
      if (defaultMountOptions) options.defaultMountOptions = defaultMountOptions();
      if (defaultSlots) options.defaultSlots = defaultSlots();

      return options;
    });
  };

  beforeEach(async () => {
    runner.resetModules();
    runner.clearAllMocks();

    // Mock vue-test-utils
    mockMount = runner.fn().mockReturnValue({
      unmount: runner.fn(),
      vm: {},
      element: {},
    });

    mockShallowMount = runner.fn().mockReturnValue({
      unmount: runner.fn(),
      vm: {},
      element: {},
    });

    runner.doMock("@vue/test-utils", () => ({
      mount: mockMount,
      shallowMount: mockShallowMount, // mockShallowMount must be created in advance using runner.fn()
    }));

    const core = await import("@testforgejs/vue-test-core");
    createTestFramework = core.createTestFramework;

    // Initializing the framework
    testComponentFactory = await createFactory();
  });

  describe("Factory Creation Object API", () => {
    it("should create a mountable factory when only component is provided", () => {
      const factory = testComponentFactory.withOptions(() => ({ component: MockComponent }));

      expect(factory).toEqual(expect.any(Function));
      expect(factory.withOptions).toEqual(expect.any(Function));

      const wrapper = factory();

      expect(mockMount).toHaveBeenCalledWith(MockComponent, expect.any(Object));
      expect(mockMount).toHaveBeenCalledTimes(1);
      expect(mockShallowMount).not.toHaveBeenCalled();
      expect(wrapper).toBe(mockMount.mock.results[0].value);
    });

    it("should prioritize defaultProps over defaultMountOptions.props", () => {
      const factory = testComponentFactory.withOptions(() => ({
        component: MockComponent,
        defaultProps: { shared: "direct default", directOnly: true },
        defaultMountOptions: {
          props: { shared: "mount default", mountOnly: true },
        },
      }));

      factory();

      expect(mockMount.mock.calls[0][1].props).toEqual({
        shared: "direct default",
        directOnly: true,
        mountOnly: true,
      });
    });

    it("should prioritize defaultSlots over defaultMountOptions.slots", () => {
      const defaultSlot = () => "from direct defaults";
      const factory = testComponentFactory.withOptions(() => ({
        component: MockComponent,
        defaultMountOptions: {
          slots: { default: () => "from mount defaults", header: "header" },
        },
        defaultSlots: { default: defaultSlot, footer: () => "footer" },
      }));

      factory();

      expect(mockMount.mock.calls[0][1].slots).toEqual({
        default: defaultSlot,
        header: "header",
        footer: expect.any(Function),
      });
    });

    it("should pass defaultMountOptions to VTU and allow mount-level shallow overrides", () => {
      const data = () => ({ count: 1 });
      const factory = testComponentFactory.withOptions(() => ({
        component: MockComponent,
        defaultMountOptions: {
          shallow: true,
          data,
          attrs: { role: "status" },
          global: { stubs: { DefaultBadge: true } },
        },
      }));

      factory();
      expect(mockShallowMount).toHaveBeenCalledTimes(1);
      expect(mockMount).not.toHaveBeenCalled();
      expect(mockShallowMount.mock.calls[0][1]).toEqual(
        expect.objectContaining({
          data,
          attrs: { role: "status" },
          global: expect.objectContaining({ stubs: { DefaultBadge: true } }),
        }),
      );

      factory({}, { shallow: false });
      expect(mockMount).toHaveBeenCalledTimes(1);
      expect(mockShallowMount).toHaveBeenCalledTimes(1);
    });

    it("should preserve factory defaults with either mount invocation API", () => {
      const defaultSlot = () => "default slot";

      const factory = testComponentFactory.withOptions(() => ({
        component: MockComponent,
        defaultProps: { fromFactory: true },
        defaultSlots: { default: defaultSlot },
      }));

      factory({ fromMount: 1 });
      factory.withOptions({ props: { fromMount: 1 } });

      expect(mockMount).toHaveBeenCalledTimes(2);

      const [positionalComponent, positionalOptions] = mockMount.mock.calls[0];
      const [objectComponent, objectOptions] = mockMount.mock.calls[1];

      // Both APIs mount the same component.
      expect(positionalComponent).toBe(MockComponent);
      expect(objectComponent).toBe(MockComponent);

      // Both APIs preserve factory-level default props.
      const expectedProps = {
        fromFactory: true,
        fromMount: 1,
      };

      expect(positionalOptions.props).toEqual(expectedProps);
      expect(objectOptions.props).toEqual(expectedProps);

      // Both APIs preserve factory-level default slots.
      const expectedSlots = {
        default: defaultSlot,
      };

      expect(positionalOptions.slots).toEqual(expectedSlots);
      expect(objectOptions.slots).toEqual(expectedSlots);
    });

    it("should support mount-level skip flags on object-created factories", () => {
      const factory = testComponentFactory.withOptions(() => ({
        component: MockComponent,
        defaultProps: { ignored: true },
        defaultMountOptions: {
          props: { ignoredMountProp: true },
          slots: { ignoredMountSlot: "factory slot" },
        },
        defaultSlots: { ignoredSlot: () => "factory slot" },
      }));

      factory(
        { runtime: true },
        { props: { runtimeMount: true }, slots: { header: "runtime header" } },
        { footer: "runtime footer" },
        { skipDefaultProps: true, skipDefaultSlots: true },
      );

      const [, options] = mockMount.mock.calls[0];
      expect(options.props).toEqual({ runtime: true, runtimeMount: true });
      expect(options.slots).toEqual({ header: "runtime header", footer: "runtime footer" });
    });

    it("should retain independent defaults for separately created object factories", () => {
      const firstFactory = testComponentFactory.withOptions(() => ({
        component: MockComponent,
        defaultProps: { origin: "first" },
        defaultSlots: { default: () => "first" },
      }));
      const secondFactory = testComponentFactory.withOptions(() => ({
        component: MockComponent,
        defaultProps: { origin: "second" },
        defaultSlots: { default: () => "second" },
      }));

      firstFactory();
      secondFactory();
      firstFactory();

      expect(mockMount.mock.calls.map(([, options]) => options.props)).toEqual([
        { origin: "first" },
        { origin: "second" },
        { origin: "first" },
      ]);
      expect(mockMount.mock.calls.map(([, options]) => options.slots.default())).toEqual([
        "first",
        "second",
        "first",
      ]);
    });

    it("should not persist runtime overrides into the creation options", () => {
      const creationOptions = () => ({
        component: MockComponent,
        defaultProps: { title: "factory" },
        defaultMountOptions: {
          attrs: { role: "alert" },
          global: { stubs: { FactoryButton: true } },
        },
      });
      const factory = testComponentFactory.withOptions(creationOptions);

      factory(
        { title: "runtime" },
        { attrs: { id: "runtime" }, global: { stubs: { RuntimeButton: true } } },
      );
      factory();

      const [, secondOptions] = mockMount.mock.calls[1];
      expect(secondOptions.props).toEqual({ title: "factory" });
      expect(secondOptions.attrs).toEqual({ role: "alert" });
      expect(secondOptions.global.stubs).toEqual({ FactoryButton: true });
      expect(creationOptions()).toEqual({
        component: MockComponent,
        defaultProps: { title: "factory" },
        defaultMountOptions: {
          attrs: { role: "alert" },
          global: { stubs: { FactoryButton: true } },
        },
      });
    });

    it("should reject a non-function resolver during factory creation", () => {
      expect(() => testComponentFactory.withOptions({})).toThrow(
        /Factory options resolver must be a function/,
      );

      expect(mockMount).not.toHaveBeenCalled();
      expect(mockShallowMount).not.toHaveBeenCalled();
    });

    it.each([
      ["invalid defaultProps", { component: MockComponent, defaultProps: 123 }, /defaultProps/],
      ["invalid defaultSlots", { component: MockComponent, defaultSlots: [] }, /defaultSlots/],
      [
        "unknown presetKey",
        { component: MockComponent, presetKey: "missing-preset" },
        /Preset "missing-preset" is not registered/,
      ],
    ])("should reject %s before mounting", (_name, options, expectedError) => {
      const factory = testComponentFactory.withOptions(() => options);

      expect(() => factory()).toThrow(expectedError);

      expect(mockMount).not.toHaveBeenCalled();
      expect(mockShallowMount).not.toHaveBeenCalled();
    });
  });

  describe("Factory Creation Positional API", () => {
    it.each([
      ["defaultProps", {}, undefined, undefined],
      ["defaultMountOptions", undefined, {}, undefined],
      ["defaultSlots", undefined, undefined, {}],
    ])(
      "should reject a non-function %s resolver during factory creation",
      (name, defaultProps, defaultMountOptions, defaultSlots) => {
        expect(() =>
          testComponentFactory(MockComponent, defaultProps, defaultMountOptions, defaultSlots),
        ).toThrow(`"${name}" must be a function.`);

        expect(mockMount).not.toHaveBeenCalled();
        expect(mockShallowMount).not.toHaveBeenCalled();
      },
    );

    it("should defer execution of positional defaults resolvers until each mount", () => {
      const defaultPropsResolver = runner.fn(() => ({ title: "Default" }));
      const defaultMountOptionsResolver = runner.fn(() => ({ attrs: { role: "status" } }));
      const defaultSlotsResolver = runner.fn(() => ({ header: "Header" }));

      const factory = testComponentFactory(
        MockComponent,
        defaultPropsResolver,
        defaultMountOptionsResolver,
        defaultSlotsResolver,
      );

      expect(defaultPropsResolver).not.toHaveBeenCalled();
      expect(defaultMountOptionsResolver).not.toHaveBeenCalled();
      expect(defaultSlotsResolver).not.toHaveBeenCalled();
      expect(mockMount).not.toHaveBeenCalled();

      factory();
      factory.withOptions({});

      expect(defaultPropsResolver).toHaveBeenCalledTimes(2);
      expect(defaultMountOptionsResolver).toHaveBeenCalledTimes(2);
      expect(defaultSlotsResolver).toHaveBeenCalledTimes(2);
      expect(mockMount).toHaveBeenCalledTimes(2);

      for (const [, options] of mockMount.mock.calls) {
        expect(options.props).toEqual({ title: "Default" });
        expect(options.attrs).toEqual({ role: "status" });
        expect(options.slots).toEqual({ header: "Header" });
      }
    });

    it("should retain independent defaults for separately created positional factories", () => {
      const firstFactory = createFactoryFromResolvers("positional", {
        defaultProps: () => ({ origin: "first" }),
        defaultSlots: () => ({ default: () => "first" }),
      });
      const secondFactory = createFactoryFromResolvers("positional", {
        defaultProps: () => ({ origin: "second" }),
        defaultSlots: () => ({ default: () => "second" }),
      });

      firstFactory();
      secondFactory();
      firstFactory.withOptions({});

      expect(mockMount.mock.calls.map(([, options]) => options.props)).toEqual([
        { origin: "first" },
        { origin: "second" },
        { origin: "first" },
      ]);
      expect(mockMount.mock.calls.map(([, options]) => options.slots.default())).toEqual([
        "first",
        "second",
        "first",
      ]);
    });

    it("should not persist runtime overrides into positional defaults", () => {
      const defaultProps = () => ({ title: "factory" });
      const defaultMountOptions = () => ({
        attrs: { role: "alert" },
        global: { stubs: { FactoryButton: true } },
      });
      const factory = createFactoryFromResolvers("positional", {
        defaultProps,
        defaultMountOptions,
      });

      factory(
        { title: "runtime" },
        { attrs: { id: "runtime" }, global: { stubs: { RuntimeButton: true } } },
      );
      factory.withOptions({});

      const [, secondOptions] = mockMount.mock.calls[1];
      expect(secondOptions.props).toEqual({ title: "factory" });
      expect(secondOptions.attrs).toEqual({ role: "alert" });
      expect(secondOptions.global.stubs).toEqual({ FactoryButton: true });
      expect(defaultProps()).toEqual({ title: "factory" });
      expect(defaultMountOptions()).toEqual({
        attrs: { role: "alert" },
        global: { stubs: { FactoryButton: true } },
      });
    });
  });

  describe("Mount-level Object API", () => {
    it("should expose withOptions on factories created through both APIs", () => {
      const positionalFactory = testComponentFactory(MockComponent);
      const objectFactory = testComponentFactory.withOptions(() => ({ component: MockComponent }));

      expect(positionalFactory.withOptions).toEqual(expect.any(Function));
      expect(objectFactory.withOptions).toEqual(expect.any(Function));

      positionalFactory.withOptions({});
      objectFactory.withOptions({});

      expect(mockMount).toHaveBeenCalledTimes(2);
      expect(mockShallowMount).not.toHaveBeenCalled();
    });

    it("should merge all four props and slots sources with the same priorities", () => {
      const factory = testComponentFactory.withOptions(() => ({
        component: MockComponent,
        defaultProps: { defA: 1, defB: 10 },
        defaultMountOptions: {
          props: { defA: 2, defC: 30 },
          slots: { slotA: "A1", slotC: "C1" },
        },
        defaultSlots: { slotA: "A2", slotB: "B2" },
      }));

      factory.withOptions({
        props: { defB: 11, userDirect: 100 },
        mountOptions: {
          props: { defC: 31, userMount: 200 },
          slots: { slotC: "C3", userMount: "user mount" },
        },
        slots: { slotB: "B4", userDirect: "user direct" },
      });

      const [, options] = mockMount.mock.calls[0];
      expect(options.props).toEqual({
        defA: 1,
        defB: 11,
        defC: 31,
        userDirect: 100,
        userMount: 200,
      });
      expect(options.slots).toEqual({
        slotA: "A2",
        slotB: "B4",
        slotC: "C3",
        userDirect: "user direct",
        userMount: "user mount",
      });
    });

    it("should prioritize direct props and slots over mountOptions at mount level", () => {
      const factory = testComponentFactory(MockComponent);

      factory.withOptions({
        props: { id: 1 },
        mountOptions: {
          props: { id: 2, name: "from mountOptions" },
          slots: { default: "from mountOptions", footer: "footer" },
        },
        slots: { default: "direct slot" },
      });

      const [, options] = mockMount.mock.calls[0];
      expect(options.props).toEqual({ id: 1, name: "from mountOptions" });
      expect(options.slots).toEqual({ default: "direct slot", footer: "footer" });
    });

    it("should apply skipDefaultProps without affecting default slots", () => {
      const factory = testComponentFactory.withOptions(() => ({
        component: MockComponent,
        defaultProps: { fromDefaultProps: true },
        defaultSlots: { default: "default slot" },
        defaultMountOptions: {
          props: { fromDefaultMount: true },
          slots: { footer: "default footer" },
        },
      }));

      factory.withOptions({
        props: { id: 1 },
        mountOptions: { props: { title: "runtime" } },
        extraOptions: { skipDefaultProps: true },
      });

      const [, options] = mockMount.mock.calls[0];
      expect(options.props).toEqual({ id: 1, title: "runtime" });
      expect(options.slots).toEqual({
        default: "default slot",
        footer: "default footer",
      });
    });

    it("should apply skipDefaultSlots without affecting default props", () => {
      const factory = testComponentFactory.withOptions(() => ({
        component: MockComponent,
        defaultProps: { fromDefaultProps: true },
        defaultMountOptions: {
          props: { fromDefaultMount: true },
          slots: { ignoredFooter: "default footer" },
        },
        defaultSlots: { ignoredHeader: "default header" },
      }));

      factory.withOptions({
        mountOptions: { slots: { footer: "runtime footer" } },
        slots: { header: "runtime header" },
        extraOptions: { skipDefaultSlots: true },
      });

      const [, options] = mockMount.mock.calls[0];
      expect(options.props).toEqual({
        fromDefaultProps: true,
        fromDefaultMount: true,
      });
      expect(options.slots).toEqual({
        footer: "runtime footer",
        header: "runtime header",
      });
    });

    it("should skip factory-level mount defaults but preserve runtime VTU options", () => {
      const defaultData = () => ({ count: 1 });
      const runtimeData = () => ({ count: 2 });
      const factory = testComponentFactory.withOptions(() => ({
        component: MockComponent,
        defaultMountOptions: {
          data: defaultData,
          attrs: { role: "button" },
          attachTo: "#default-root",
          global: { stubs: { DefaultButton: true } },
        },
      }));

      factory.withOptions({
        mountOptions: {
          data: runtimeData,
          attrs: { id: "runtime" },
          attachTo: "#runtime-root",
          global: { stubs: { RuntimeButton: true } },
        },
        extraOptions: { skipDefaultOptions: true },
      });

      const [, options] = mockMount.mock.calls[0];
      expect(options.data).toBe(runtimeData);
      expect(options.attrs).toEqual({ id: "runtime" });
      expect(options.attachTo).toBe("#runtime-root");
      expect(options.global.stubs).toEqual({ RuntimeButton: true });
    });

    it("should deep-merge global configuration from factory and invocation options", () => {
      const mockApi = { getUser: runner.fn() };
      const factory = testComponentFactory(
        MockComponent,
        () => ({}),
        () => ({
          global: {
            stubs: { BaseButton: true },
            mocks: { $api: mockApi },
            provide: { theme: "light", locale: "en" },
            config: { optionMergeStrategies: { foo: "default" } },
          },
        }),
      );

      factory.withOptions({
        mountOptions: {
          global: {
            stubs: { BaseModal: true },
            mocks: { $store: {} },
            provide: { theme: "dark" },
            config: { optionMergeStrategies: { bar: "runtime" } },
          },
        },
      });

      const [, options] = mockMount.mock.calls[0];
      expect(options.global.stubs).toEqual({ BaseButton: true, BaseModal: true });
      expect(options.global.mocks).toEqual({ $api: mockApi, $store: {} });
      expect(options.global.provide).toEqual({ theme: "dark", locale: "en" });
      expect(options.global.config.optionMergeStrategies).toEqual({
        foo: "default",
        bar: "runtime",
      });
    });

    it("should merge and deduplicate third-party global.plugins", () => {
      const pluginA = { install() {} };
      const pluginB = { install() {} };
      const factory = testComponentFactory(
        MockComponent,
        () => ({}),
        () => ({
          global: { plugins: [pluginA] },
        }),
      );

      factory.withOptions({
        mountOptions: {
          global: { plugins: [pluginA, pluginB] },
          skipManagedPlugins: true,
        },
      });

      const [, options] = mockMount.mock.calls[0];
      expect(options.global.plugins).toEqual([pluginA, pluginB]);
    });

    it("should pass data, attrs, attachTo, and other VTU options through mountOptions", () => {
      const data = () => ({ count: 3 });
      const factory = testComponentFactory(MockComponent);

      factory.withOptions({
        mountOptions: {
          data,
          attrs: { "data-testid": "alert" },
          attachTo: "#app",
          inheritAttrs: false,
        },
      });

      const [, options] = mockMount.mock.calls[0];
      expect(options).toEqual(
        expect.objectContaining({
          data,
          attrs: { "data-testid": "alert" },
          attachTo: "#app",
          inheritAttrs: false,
        }),
      );
    });

    it("should respect shallowByDefault and per-mount shallow overrides", async () => {
      testComponentFactory = await createFactoryWithShallowDefault(true);
      const factory = testComponentFactory(MockComponent);

      factory.withOptions({});
      expect(mockShallowMount).toHaveBeenCalledTimes(1);
      expect(mockMount).not.toHaveBeenCalled();

      factory.withOptions({ mountOptions: { shallow: false } });
      expect(mockMount).toHaveBeenCalledTimes(1);
      expect(mockShallowMount).toHaveBeenCalledTimes(1);

      factory.withOptions({ mountOptions: { shallow: true } });
      expect(mockShallowMount).toHaveBeenCalledTimes(2);
    });

    it("should honor shallow: true when shallowByDefault is false", async () => {
      testComponentFactory = await createFactoryWithShallowDefault(false);
      const factory = testComponentFactory(MockComponent);

      factory.withOptions({ mountOptions: { shallow: true } });
      expect(mockShallowMount).toHaveBeenCalledTimes(1);
      expect(mockMount).not.toHaveBeenCalled();
    });

    it("should produce the same VTU mount arguments as the positional API", () => {
      const factory = testComponentFactory.withOptions(() => ({
        component: MockComponent,
        defaultProps: { status: "default" },
        defaultMountOptions: {
          attrs: { role: "alert" },
          global: { stubs: { BaseButton: true } },
        },
        defaultSlots: { footer: "default footer" },
      }));
      const props = { status: "runtime", id: 42 };
      const mountOptions = {
        attrs: { id: "alert" },
        global: { stubs: { RuntimeButton: true } },
        slots: { header: "mount header" },
        skipManagedPlugins: true,
      };
      const slots = { default: "runtime content" };
      const extraOptions = { skipDefaultProps: false, skipDefaultSlots: false };

      factory(props, mountOptions, slots, extraOptions);
      factory.withOptions({ props, mountOptions, slots, extraOptions });

      expect(mockMount).toHaveBeenCalledTimes(2);
      expect(mockShallowMount).not.toHaveBeenCalled();
      expect(mockMount.mock.calls[1]).toEqual(mockMount.mock.calls[0]);
    });

    it.each([
      ["positional", "positional"],
      ["positional", "object"],
      ["object", "positional"],
      ["object", "object"],
    ])(
      "should not retain previous mount props, slots, or extraOptions (%s creation / %s invocation)",
      (creationApi, invocationApi) => {
        const factory = createFactoryFromResolvers(creationApi, {
          defaultProps: () => ({ defaultValue: true }),
          defaultSlots: () => ({ footer: "factory footer" }),
        });

        const mountWith = (options) =>
          invocationApi === "object"
            ? factory.withOptions(options)
            : factory(options.props, options.mountOptions, options.slots, options.extraOptions);

        mountWith({
          props: { runtimeValue: true },
          slots: { footer: "runtime footer" },
          extraOptions: { skipDefaultProps: true, skipDefaultSlots: true },
        });
        mountWith({});

        const [, first] = mockMount.mock.calls[0];
        const [, second] = mockMount.mock.calls[1];

        expect(mockMount).toHaveBeenCalledTimes(2);
        expect(first.props).toEqual({ runtimeValue: true });
        expect(first.slots).toEqual({ footer: "runtime footer" });
        expect(second.props).toEqual({ defaultValue: true });
        expect(second.slots).toEqual({ footer: "factory footer" });
      },
    );

    it("should reject mount-only options at the top level without invoking VTU", () => {
      const factory = testComponentFactory(MockComponent);

      expect(() => factory.withOptions({ skipDefaultProps: true })).toThrow(
        /Unknown option "skipDefaultProps"/,
      );
      expect(() => factory.withOptions({ presetKey: "default" })).toThrow(
        /Unknown option "presetKey"/,
      );
      expect(mockMount).not.toHaveBeenCalled();
      expect(mockShallowMount).not.toHaveBeenCalled();
    });
  });

  describe("VTU Mount Functions", () => {
    describe("when shallowByDefault = true", () => {
      beforeEach(async () => {
        testComponentFactory = await createFactoryWithShallowDefault(true);
      });

      it("should use shallowMount when shallow option is not provided", () => {
        const factory = testComponentFactory(MockComponent);

        factory();

        expect(mockShallowMount).toHaveBeenCalledTimes(1);
        expect(mockMount).not.toHaveBeenCalled();
      });

      it("should use shallowMount when shallow is true", () => {
        const factory = testComponentFactory(MockComponent);

        factory({}, { shallow: true });

        expect(mockShallowMount).toHaveBeenCalledTimes(1);
        expect(mockMount).not.toHaveBeenCalled();
      });

      it("should use mount when shallow is false", () => {
        const factory = testComponentFactory(MockComponent);

        factory({}, { shallow: false });

        expect(mockMount).toHaveBeenCalledTimes(1);
        expect(mockShallowMount).not.toHaveBeenCalled();
      });
    });

    describe("when shallowByDefault = false", () => {
      beforeEach(async () => {
        testComponentFactory = await createFactoryWithShallowDefault(false);
      });

      it("should use mount when shallow option is not provided", () => {
        const factory = testComponentFactory(MockComponent);

        factory();

        expect(mockMount).toHaveBeenCalledTimes(1);
        expect(mockShallowMount).not.toHaveBeenCalled();
      });

      it("should use shallowMount when shallow is true", () => {
        const factory = testComponentFactory(MockComponent);

        factory({}, { shallow: true });

        expect(mockShallowMount).toHaveBeenCalledTimes(1);
        expect(mockMount).not.toHaveBeenCalled();
      });

      it("should use mount when shallow is false", () => {
        const factory = testComponentFactory(MockComponent);

        factory({}, { shallow: false });

        expect(mockMount).toHaveBeenCalledTimes(1);
        expect(mockShallowMount).not.toHaveBeenCalled();
      });
    });
  });

  describe("Props Priority", () => {
    describe("Specific Test Level", () => {
      it("should prioritize direct props over mountOptions.props when keys conflict", () => {
        const factory = testComponentFactory(MockComponent);

        // The props vs. mountOptions.props argument
        factory({ id: 1 }, { props: { id: 2 } });

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: { id: 1 }, // The direct argument won
          }),
        );
      });

      it("should shallow-merge direct props with mountOptions.props when no conflicts", () => {
        const factory = testComponentFactory(MockComponent);

        // The props vs. mountOptions.props argument
        factory({ id: 1 }, { props: { newProps: 2 } });

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: { id: 1, newProps: 2 },
          }),
        );
      });

      it("should use only mountOptions.props when direct props are not provided", () => {
        const factory = testComponentFactory(MockComponent);

        factory({}, { props: { newProps: 2 } });

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: { newProps: 2 },
          }),
        );
      });
    });

    describe("Test Suite Level", () => {
      it("should prioritize direct defaultProps over defaultMountOptions.props when keys conflict", () => {
        // The defaultProps vs. defaultMountOptions.props argument
        const factory = testComponentFactory(
          MockComponent,
          () => ({ id: 1 }),
          () => ({
            props: { id: 2 },
          }),
        );

        factory();

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: { id: 1 }, // The direct argument won
          }),
        );
      });

      it("should shallow-merge direct props with mountOptions.props when no conflicts", () => {
        // The defaultProps vs. defaultMountOptions.props argument
        const factory = testComponentFactory(
          MockComponent,
          () => ({ id: 1 }),
          () => ({
            props: { newProps: 2 },
          }),
        );

        factory();

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: { id: 1, newProps: 2 },
          }),
        );
      });

      it("should use only mountOptions.props when direct props are not provided", () => {
        const factory = testComponentFactory(
          MockComponent,
          () => ({}),
          () => ({ props: { newProps: 2 } }),
        );

        factory();

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: { newProps: 2 },
          }),
        );
      });
    });

    describe("Both Levels", () => {
      describe("when skipDefaultProps = false (default behavior)", () => {
        // All 4 sources are active
        it("should merge all four sources with direct props having highest priority", () => {
          const factory = testComponentFactory(
            MockComponent,
            () => ({ defA: 1, defB: 10 }), // defaultProps
            () => ({ props: { defA: 2, defC: 30 } }), // defaultMountOptions.props
          );

          factory(
            { defB: 11, userDirect: 100 }, // props (direct argument)
            { props: { defC: 31, userMount: 200 } }, // mountOptions.props
          );

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              props: {
                defA: 1, // defaultProps takes precedence over defaultMountOptions
                defB: 11, // direct props take precedence over defaultProps
                defC: 31, // mountOptions.props take precedence over defaultMountOptions
                userDirect: 100, // direct props
                userMount: 200, // mountOptions.props
              },
            }),
          );
        });

        it("should fall back to defaultMountOptions.props when direct props & mountOptions.props & defaultProps are empty", () => {
          const factory = testComponentFactory(
            MockComponent,
            () => ({}),
            () => ({
              props: { fallback: "from-default-mount" },
            }),
          );

          factory({}, {});

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              props: { fallback: "from-default-mount" },
            }),
          );
        });

        it("should fall back to defaultProps when defaultMountOptions.props is empty", () => {
          const factory = testComponentFactory(
            MockComponent,
            () => ({ base: "default-props" }),
            () => ({}),
          );

          factory({}, {});

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              props: { base: "default-props" },
            }),
          );
        });
      });

      describe("when skipDefaultProps = true", () => {
        it("should ignore defaultProps and defaultMountOptions but still merge the other two sources", () => {
          const factory = testComponentFactory(
            MockComponent,
            () => ({ ignored: "default-props" }),
            () => ({ props: { ignoredBase: "default-mount" } }),
          );

          factory(
            { userDirect: 100 },
            {
              props: { userMount: 200 },
            },
            {},
            { skipDefaultProps: true },
          );

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              props: {
                userDirect: 100, // direct props
                userMount: 200, // mountOptions.props
              },
            }),
          );
        });

        it("should prioritize direct props over mountOptions.props", () => {
          const factory = testComponentFactory(
            MockComponent,
            () => ({}),
            () => ({
              props: { key: "default-mount-value" },
            }),
          );

          factory(
            { key: "direct-value" },
            {
              props: { key: "mount-options-value" },
            },
            {},
            { skipDefaultProps: true },
          );

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              props: { key: "direct-value" },
            }),
          );
        });
      });
    });

    describe("defaultMountOptions.props vs mountOptions.props", () => {
      it("should shallow-merge props between defaultMountOptions and mountOptions", () => {
        const factory = testComponentFactory(
          MockComponent,
          () => ({}),
          () => ({
            props: {
              role: "button",
            },
          }),
        );

        factory(
          {},
          {
            props: {
              id: "submit",
            },
          },
        );

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: {
              role: "button",
              id: "submit",
            },
          }),
        );
      });

      it("should prioritize mountOptions.props over defaultMountOptions.props when keys conflict", () => {
        const factory = testComponentFactory(
          MockComponent,
          () => ({}),
          () => ({
            props: {
              id: 1,
              role: "button",
            },
          }),
        );

        factory(
          {},
          {
            props: {
              id: 2,
            },
          },
        );

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: {
              id: 2,
              role: "button",
            },
          }),
        );
      });
    });

    describe("Factory Props Resolution and Isolation", () => {
      const createProfile = () => ({
        name: "Original",
        roles: ["user"],
      });

      const mutateProfileDuringFirstMount = () => {
        // VTU is mocked in this suite: simulate a component mutating a nested prop.
        mockMount.mockImplementationOnce((_component, options) => {
          options.props.profile.name = "Modified";
          options.props.profile.roles.push("admin");

          return { unmount: runner.fn(), vm: {}, element: {} };
        });
      };

      it.each(["positional", "object"])(
        "should isolate nested defaultProps between mounts (%s creation API)",
        (creationApi) => {
          const factory = createFactoryFromResolvers(creationApi, {
            defaultProps: () => ({ profile: createProfile() }),
          });

          mutateProfileDuringFirstMount();

          factory();
          factory.withOptions({});

          const firstProfile = mockMount.mock.calls[0][1].props.profile;
          const secondProfile = mockMount.mock.calls[1][1].props.profile;

          expect(mockMount).toHaveBeenCalledTimes(2);
          expect(firstProfile).toEqual({ name: "Modified", roles: ["user", "admin"] });
          expect(secondProfile).toEqual(createProfile());
          expect(secondProfile).not.toBe(firstProfile);
          expect(secondProfile.roles).not.toBe(firstProfile.roles);
        },
      );

      it.each(["positional", "object"])(
        "should isolate nested defaultMountOptions.props between mounts (%s creation API)",
        (creationApi) => {
          const factory = createFactoryFromResolvers(creationApi, {
            defaultMountOptions: () => ({ props: { profile: createProfile() } }),
          });

          mutateProfileDuringFirstMount();

          factory.withOptions({});
          factory();

          const firstProfile = mockMount.mock.calls[0][1].props.profile;
          const secondProfile = mockMount.mock.calls[1][1].props.profile;

          expect(mockMount).toHaveBeenCalledTimes(2);
          expect(firstProfile).toEqual({ name: "Modified", roles: ["user", "admin"] });
          expect(secondProfile).toEqual(createProfile());
          expect(secondProfile).not.toBe(firstProfile);
          expect(secondProfile.roles).not.toBe(firstProfile.roles);
        },
      );

      it.each(["positional", "object"])(
        "should preserve references of explicitly provided mount-level props (%s creation API)",
        (creationApi) => {
          const profile = { name: "Original" };
          const factory = createFactoryFromResolvers(creationApi);

          factory({ profile });
          factory.withOptions({ props: { profile } });

          expect(mockMount).toHaveBeenCalledTimes(2);
          expect(mockMount.mock.calls[0][1].props.profile).toBe(profile);
          expect(mockMount.mock.calls[1][1].props.profile).toBe(profile);
        },
      );

      it.each(["positional", "object"])(
        "should preserve class instances in defaultProps (%s creation API)",
        (creationApi) => {
          class UserService {
            getName() {
              return "John";
            }
          }

          const service = new UserService();
          const factory = createFactoryFromResolvers(creationApi, {
            defaultProps: () => ({ service }),
          });

          factory();

          const mountedService = mockMount.mock.calls[0][1].props.service;
          expect(mountedService).toBe(service);
          expect(mountedService).toBeInstanceOf(UserService);
        },
      );

      it.each(["positional", "object"])(
        "should create independent class instances when resolved per mount (%s creation API)",
        (creationApi) => {
          class UserService {
            constructor() {
              this.users = [];
            }
          }

          const factory = createFactoryFromResolvers(creationApi, {
            defaultProps: () => ({ service: new UserService() }),
          });

          factory();
          factory.withOptions({});

          const firstService = mockMount.mock.calls[0][1].props.service;
          const secondService = mockMount.mock.calls[1][1].props.service;

          expect(mockMount).toHaveBeenCalledTimes(2);
          expect(firstService).toBeInstanceOf(UserService);
          expect(secondService).toBeInstanceOf(UserService);
          expect(secondService).not.toBe(firstService);
          expect(secondService.users).not.toBe(firstService.users);
        },
      );
    });
  });

  describe("Slots Priority", () => {
    describe("Specific Test Level", () => {
      it("should prioritize direct slots over mountOptions.slots when keys conflict", () => {
        const factory = testComponentFactory(MockComponent);

        // Direct slots vs. mountOptions.slots argument
        factory({}, { slots: { default: "options slot" } }, { default: "direct slot" });

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            slots: { default: "direct slot" }, // The direct argument won
          }),
        );
      });

      it("should shallow-merge direct slots with mountOptions.slots when no conflicts", () => {
        const factory = testComponentFactory(MockComponent);

        // The slots vs. mountOptions.slots argument
        factory({}, { slots: { footer: "footer slot" } }, { header: "header slot" });

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            slots: { header: "header slot", footer: "footer slot" },
          }),
        );
      });

      it("should use only mountOptions.slots when direct slots are not provided", () => {
        const factory = testComponentFactory(MockComponent);

        factory({}, { slots: { default: "options slot" } });

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            slots: { default: "options slot" },
          }),
        );
      });
    });

    describe("Test Suite Level", () => {
      it("should prioritize direct defaultSlots over defaultMountOptions.slots when keys conflict", () => {
        // The defaultSlots vs. defaultMountOptions.slots argument
        const factory = testComponentFactory(
          MockComponent,
          undefined,
          () => ({ slots: { default: "options slot" } }),
          () => ({ default: "direct slot" }),
        );

        factory();

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            slots: { default: "direct slot" }, // The direct argument won
          }),
        );
      });

      it("should shallow-merge direct defaultSlots with defaultMountOptions.slots when no conflicts", () => {
        // The defaultSlots vs. defaultMountOptions.slots argument
        const factory = testComponentFactory(
          MockComponent,
          undefined,
          () => ({ slots: { footer: "footer slot" } }),
          () => ({ header: "header slot" }),
        );

        factory();

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            slots: { header: "header slot", footer: "footer slot" },
          }),
        );
      });

      it("should use only defaultMountOptions.slots when direct defaultSlots are not provided", () => {
        const factory = testComponentFactory(MockComponent, undefined, () => ({
          slots: { default: "options slot" },
        }));

        factory();

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            slots: { default: "options slot" },
          }),
        );
      });
    });

    describe("Both Levels", () => {
      describe("when skipDefaultSlots = false (default behavior)", () => {
        it("should merge all four sources with direct slots having highest priority", () => {
          const factory = testComponentFactory(
            MockComponent,
            undefined,
            () => ({ slots: { slotA: "A1", slotC: "C1" } }), // defaultMountOptions.slots
            () => ({ slotA: "A2", slotB: "B2" }), // defaultSlots
          );

          factory(
            {},
            { slots: { slotC: "C3", userMount: "user mount" } }, // mountOptions.props
            { slotB: "B4", userDirect: "user direct" }, // slots (direct argument)
          );

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              slots: {
                slotA: "A2", // defaultSlots takes precedence over defaultMountOptions
                slotB: "B4", // direct slots take precedence over defaultSlots
                slotC: "C3", // mountOptions.slots take precedence over defaultMountOptions
                userDirect: "user direct", // direct slots
                userMount: "user mount", // mountOptions.slots
              },
            }),
          );
        });

        it("should fall back to defaultMountOptions.slots when direct slots & mountOptions.slots & defaultSlots are empty", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            slots: { fallback: "from-default-mount" },
          }));

          factory({}, {});

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              slots: { fallback: "from-default-mount" },
            }),
          );
        });

        it("should fall back to defaultSlots when defaultMountOptions.slots is empty", () => {
          const factory = testComponentFactory(MockComponent, undefined, undefined, () => ({
            base: "default-slots",
          }));

          factory();

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              slots: { base: "default-slots" },
            }),
          );
        });
      });

      describe("when skipDefaultSlots = true", () => {
        it("should ignore defaultSlots and defaultMountOptions but still merge the other two sources", () => {
          const factory = testComponentFactory(
            MockComponent,
            undefined,
            () => ({ props: { ignoredBase: "default-mount" } }),
            () => ({ ignored: "default-slots" }),
          );

          factory(
            {},
            {
              slots: { userMount: "user-mount" },
            },
            { userDirect: "user-direct" },
            { skipDefaultSlots: true },
          );

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              slots: {
                userDirect: "user-direct", // direct slots
                userMount: "user-mount", // mountOptions.slots
              },
            }),
          );
        });

        it("should prioritize direct slots over mountOptions.slots", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            slots: { default: "default-mount-value" },
          }));

          factory(
            {},
            {
              slots: { default: "mount-options-value" },
            },
            { default: "direct-value" },
            { skipDefaultSlots: true },
          );

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              slots: { default: "direct-value" },
            }),
          );
        });
      });
    });
  });

  describe("Global Options Merging", () => {
    it("should use only defaultMountOptions when specific test options are missing", () => {
      const factory = testComponentFactory(MockComponent, undefined, () => ({
        global: {
          stubs: {
            DefaultBtn: true,
          },
        },
      }));

      factory();

      const [, options] = mockMount.mock.calls[0];

      expect(options.global.stubs).toEqual({ DefaultBtn: true });
    });

    it("should use only mountOptions when defaultMountOptions are missing", () => {
      const factory = testComponentFactory(MockComponent, undefined, undefined);

      factory({}, { global: { mocks: { $t: () => "" } } });

      const [, options] = mockMount.mock.calls[0];
      expect(options.global.mocks).toHaveProperty("$t");
    });

    it("should deeply merge nested objects like stubs and mocks", () => {
      const mockApi = {
        getUser: runner.fn(),
        getUsers: runner.fn(),
        createUser: runner.fn(),
      };

      const factory = testComponentFactory(MockComponent, undefined, () => ({
        global: {
          stubs: { BaseButton: true },
          mocks: { $api: mockApi },
        },
      }));

      factory(
        {},
        {
          global: {
            stubs: { BaseModal: true },
            mocks: { $store: {} },
          },
        },
      );

      const [, options] = mockMount.mock.calls[0];
      expect(options.global.stubs).toEqual({ BaseButton: true, BaseModal: true });
      expect(options.global.mocks).toEqual({
        $api: mockApi,
        $store: {},
      });
    });

    it("should prioritize specific mountOptions over defaultMountOptions for the same key", () => {
      const factory = testComponentFactory(MockComponent, undefined, () => ({
        global: { provide: { theme: "light" } },
      }));

      factory({}, { global: { provide: { theme: "dark" } } });

      const [, options] = mockMount.mock.calls[0];
      expect(options.global.provide.theme).toBe("dark");
    });
  });

  describe("Factory Defaults Isolation", () => {
    it.each(["positional", "object"])(
      "should isolate state captured by defaultSlots callbacks between mounts (%s creation API)",
      (creationApi) => {
        const factory = createFactoryFromResolvers(creationApi, {
          defaultSlots: () => {
            let renderCount = 0;
            return { default: () => `render ${++renderCount}` };
          },
        });

        factory();
        factory.withOptions({});

        const firstSlot = mockMount.mock.calls[0][1].slots.default;
        const secondSlot = mockMount.mock.calls[1][1].slots.default;

        expect(mockMount).toHaveBeenCalledTimes(2);
        expect(secondSlot).not.toBe(firstSlot);
        expect(firstSlot()).toBe("render 1");
        expect(firstSlot()).toBe("render 2");
        expect(secondSlot()).toBe("render 1");
      },
    );

    it.each(["positional", "object"])(
      "should isolate state captured by defaultMountOptions.slots callbacks between mounts (%s creation API)",
      (creationApi) => {
        const factory = createFactoryFromResolvers(creationApi, {
          defaultMountOptions: () => {
            let renderCount = 0;
            return { slots: { header: () => `header ${++renderCount}` } };
          },
        });

        factory.withOptions({});
        factory();

        const firstSlot = mockMount.mock.calls[0][1].slots.header;
        const secondSlot = mockMount.mock.calls[1][1].slots.header;

        expect(mockMount).toHaveBeenCalledTimes(2);
        expect(secondSlot).not.toBe(firstSlot);
        expect(firstSlot()).toBe("header 1");
        expect(firstSlot()).toBe("header 2");
        expect(secondSlot()).toBe("header 1");
      },
    );

    it.each(["positional", "object"])(
      "should isolate nested defaultMountOptions.global.provide values between mounts (%s creation API)",
      (creationApi) => {
        const factory = createFactoryFromResolvers(creationApi, {
          defaultMountOptions: () => ({
            global: {
              provide: {
                userStore: {
                  profile: { name: "Original" },
                  roles: ["user"],
                },
              },
            },
          }),
        });

        factory();

        const firstProvide = mockMount.mock.calls[0][1].global.provide;
        firstProvide.userStore.profile.name = "Modified";
        firstProvide.userStore.roles.push("admin");

        factory.withOptions({});

        const secondProvide = mockMount.mock.calls[1][1].global.provide;

        expect(mockMount).toHaveBeenCalledTimes(2);
        expect(firstProvide.userStore.roles).toEqual(["user", "admin"]);
        expect(secondProvide.userStore).toEqual({
          profile: { name: "Original" },
          roles: ["user"],
        });
        expect(secondProvide).not.toBe(firstProvide);
        expect(secondProvide.userStore).not.toBe(firstProvide.userStore);
        expect(secondProvide.userStore.profile).not.toBe(firstProvide.userStore.profile);
        expect(secondProvide.userStore.roles).not.toBe(firstProvide.userStore.roles);
      },
    );

    it.each(["positional", "object"])(
      "should isolate defaultMountOptions.attrs between mounts (%s creation API)",
      (creationApi) => {
        const factory = createFactoryFromResolvers(creationApi, {
          defaultMountOptions: () => ({ attrs: { role: "alert" } }),
        });

        factory();
        const firstAttrs = mockMount.mock.calls[0][1].attrs;
        firstAttrs.role = "button";

        factory.withOptions({});
        const secondAttrs = mockMount.mock.calls[1][1].attrs;

        expect(mockMount).toHaveBeenCalledTimes(2);
        expect(firstAttrs.role).toBe("button");
        expect(secondAttrs).toEqual({ role: "alert" });
        expect(secondAttrs).not.toBe(firstAttrs);
      },
    );

    it.each(["positional", "object"])(
      "should recreate global.plugins arrays while reusing stateless Vue plugin definitions (%s creation API)",
      (creationApi) => {
        const pluginA = { install() {} };
        const pluginB = { install() {} };

        const factory = createFactoryFromResolvers(creationApi, {
          defaultMountOptions: () => ({ global: { plugins: [pluginA] } }),
        });

        factory();
        const firstPlugins = mockMount.mock.calls[0][1].global.plugins;

        // Simulate mutation of the first mount's plugins array.
        firstPlugins.push(pluginB);

        factory.withOptions({});
        const secondPlugins = mockMount.mock.calls[1][1].global.plugins;

        expect(mockMount).toHaveBeenCalledTimes(2);
        expect(firstPlugins).toContain(pluginA);
        expect(firstPlugins).toContain(pluginB);
        expect(secondPlugins).toContain(pluginA);
        expect(secondPlugins).not.toContain(pluginB);
        expect(secondPlugins).not.toBe(firstPlugins);
      },
    );

    it.each(["positional", "object"])(
      "should isolate defaultMountOptions.global.stubs between mounts (%s creation API)",
      (creationApi) => {
        const factory = createFactoryFromResolvers(creationApi, {
          defaultMountOptions: () => ({ global: { stubs: { BaseButton: true } } }),
        });

        factory();
        const firstStubs = mockMount.mock.calls[0][1].global.stubs;
        firstStubs.BaseButton = false;

        factory.withOptions({});
        const secondStubs = mockMount.mock.calls[1][1].global.stubs;

        expect(mockMount).toHaveBeenCalledTimes(2);
        expect(firstStubs.BaseButton).toBe(false);
        expect(secondStubs).toEqual({ BaseButton: true });
        expect(secondStubs).not.toBe(firstStubs);
      },
    );
  });

  describe("VTU Mounting Options Passthrough", () => {
    // data, attrs and attachTo are processed as flat VTU mount options
    // through withBaseMountOptions().
    describe("data", () => {
      it("should use data from mountOptions", () => {
        const factory = testComponentFactory(MockComponent);

        const dataFn = () => ({
          count: 1,
        });

        factory({}, { data: dataFn });

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            data: dataFn,
          }),
        );
      });

      it("should preserve defaultMountOptions.data when mountOptions.data is not provided", () => {
        const defaultData = () => ({
          count: 1,
        });

        const factory = testComponentFactory(MockComponent, undefined, () => ({
          data: defaultData,
        }));

        factory();

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            data: defaultData,
          }),
        );
      });

      it("should allow mountOptions.data to override defaultMountOptions.data", () => {
        const defaultData = () => ({
          count: 1,
        });

        const overrideData = () => ({
          count: 2,
        });

        const factory = testComponentFactory(MockComponent, undefined, () => ({
          data: defaultData,
        }));

        factory({}, { data: overrideData });

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            data: overrideData,
          }),
        );
      });

      it("should ignore defaultMountOptions.data when skipDefaultOptions is true", () => {
        const defaultData = () => ({
          count: 1,
        });

        const factory = testComponentFactory(MockComponent, undefined, () => ({
          data: defaultData,
        }));

        factory(
          {},
          {},
          {},
          {
            skipDefaultOptions: true,
          },
        );

        const [, options] = mockMount.mock.calls[0];

        expect(options).not.toHaveProperty("data");
      });
    });

    describe("attrs", () => {
      it("should pass attrs option to mount()", () => {
        const factory = testComponentFactory(MockComponent);

        factory(
          {},
          {
            attrs: {
              id: "test-id",
              "data-testid": "button",
            },
          },
        );

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            attrs: {
              id: "test-id",
              "data-testid": "button",
            },
          }),
        );
      });

      it("should use defaultMountOptions.attrs when mountOptions.attrs are not provided", () => {
        const factory = testComponentFactory(MockComponent, undefined, () => ({
          attrs: {
            role: "button",
          },
        }));

        factory();

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            attrs: {
              role: "button",
            },
          }),
        );
      });

      it("should shallow-merge attrs between defaultMountOptions and mountOptions", () => {
        const factory = testComponentFactory(MockComponent, undefined, () => ({
          attrs: {
            role: "button",
          },
        }));

        factory(
          {},
          {
            attrs: {
              id: "submit",
            },
          },
        );

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            attrs: {
              role: "button",
              id: "submit",
            },
          }),
        );
      });

      it("should prioritize mountOptions.attrs over defaultMountOptions.attrs when keys conflict", () => {
        const factory = testComponentFactory(MockComponent, undefined, () => ({
          attrs: {
            role: "button",
          },
        }));

        factory(
          {},
          {
            attrs: {
              role: "link",
            },
          },
        );

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            attrs: {
              role: "link",
            },
          }),
        );
      });

      it("should ignore defaultMountOptions.attrs when skipDefaultOptions is true", () => {
        const factory = testComponentFactory(MockComponent, undefined, () => ({
          attrs: {
            role: "button",
          },
        }));

        factory(
          {},
          {
            attrs: {
              id: "submit",
            },
          },
          {},
          {
            skipDefaultOptions: true,
          },
        );

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            attrs: {
              id: "submit",
            },
          }),
        );
      });
    });

    describe("attachTo", () => {
      it("should use attachTo from mountOptions", () => {
        const target = "#app";

        const factory = testComponentFactory(MockComponent);

        factory(
          {},
          {
            attachTo: target,
          },
        );

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            attachTo: target,
          }),
        );
      });

      it("should use attachTo from defaultMountOptions when mountOptions.attachTo is not provided", () => {
        const factory = testComponentFactory(MockComponent, undefined, () => ({
          attachTo: "#default-root",
        }));

        factory();

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            attachTo: "#default-root",
          }),
        );
      });

      it("should allow mountOptions.attachTo to override defaultMountOptions.attachTo", () => {
        const factory = testComponentFactory(MockComponent, undefined, () => ({
          attachTo: "#default-root",
        }));

        factory(
          {},
          {
            attachTo: "#test-root",
          },
        );

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            attachTo: "#test-root",
          }),
        );
      });

      it("should ignore defaultMountOptions.attachTo when skipDefaultOptions is true", () => {
        const factory = testComponentFactory(MockComponent, undefined, () => ({
          attachTo: "#default-root",
        }));

        factory(
          {},
          {},
          {},
          {
            skipDefaultOptions: true,
          },
        );

        const [, options] = mockMount.mock.calls[0];

        expect(options.attachTo).toBeUndefined();
      });
    });

    describe("unknown options", () => {
      it("should preserve unknown VTU options", () => {
        const factory = testComponentFactory(MockComponent);

        factory(
          {},
          {
            inheritAttrs: false,
          },
        );

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            inheritAttrs: false,
          }),
        );
      });
    });

    describe("global", () => {
      describe("components", () => {
        it("should use global.components from mountOptions", () => {
          const factory = testComponentFactory(MockComponent);

          const TestButton = { name: "TestButton" };

          factory(
            {},
            {
              global: {
                components: {
                  TestButton,
                },
              },
            },
          );

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              global: expect.objectContaining({
                components: {
                  TestButton,
                },
              }),
            }),
          );
        });

        it("should use global.components from defaultMountOptions", () => {
          const TestButton = { name: "TestButton" };

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              components: {
                TestButton,
              },
            },
          }));

          factory();

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              global: expect.objectContaining({
                components: {
                  TestButton,
                },
              }),
            }),
          );
        });

        it("should merge global.components objects", () => {
          const BaseButton = { name: "BaseButton" };
          const TestButton = { name: "TestButton" };

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              components: {
                BaseButton,
              },
            },
          }));

          factory(
            {},
            {
              global: {
                components: {
                  TestButton,
                },
              },
            },
          );

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              global: expect.objectContaining({
                components: {
                  BaseButton,
                  TestButton,
                },
              }),
            }),
          );
        });

        it("should allow mountOptions.global.components to override default components", () => {
          const DefaultButton = { name: "DefaultButton" };
          const OverrideButton = { name: "OverrideButton" };

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              components: {
                AppButton: DefaultButton,
              },
            },
          }));

          factory(
            {},
            {
              global: {
                components: {
                  AppButton: OverrideButton,
                },
              },
            },
          );

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              global: expect.objectContaining({
                components: {
                  AppButton: OverrideButton,
                },
              }),
            }),
          );
        });

        it("should ignore default global.components when skipDefaultOptions is true", () => {
          const BaseButton = { name: "BaseButton" };

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              components: {
                BaseButton,
              },
            },
          }));

          factory(
            {},
            {},
            {},
            {
              skipDefaultOptions: true,
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.components).toBeUndefined();
        });
      });

      describe("plugins", () => {
        it("should use global.plugins from mountOptions when defaultMountOptions are empty", () => {
          const pluginA = { install() {} };

          const factory = testComponentFactory(MockComponent);

          factory(
            {},
            {
              global: {
                plugins: [pluginA],
              },
              skipManagedPlugins: true,
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.plugins).toEqual([pluginA]);
        });

        it("should preserve defaultMountOptions.global.plugins when no mount-level plugins are provided", () => {
          const pluginA = { install() {} };

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              plugins: [pluginA],
            },
          }));

          factory(
            {},
            {
              skipManagedPlugins: true,
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.plugins).toHaveLength(1);
          expect(options.global.plugins[0]).toBe(pluginA);
        });

        it("should concatenate global.plugins arrays", () => {
          const pluginA = { install() {} };
          const pluginB = { install() {} };

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              plugins: [pluginA],
            },
          }));

          factory(
            {},
            {
              global: {
                plugins: [pluginB],
              },
              skipManagedPlugins: true,
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.plugins).toEqual([pluginA, pluginB]);
        });

        it("should deduplicate identical plugin references", () => {
          const pluginA = { install() {} };

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              plugins: [pluginA],
            },
          }));

          factory(
            {},
            {
              global: {
                plugins: [pluginA],
              },
              skipManagedPlugins: true,
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.plugins).toEqual([pluginA]);
        });

        it("should ignore default global.plugins when skipDefaultOptions is true", () => {
          const pluginA = { install() {} };

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              plugins: [pluginA],
            },
          }));

          factory(
            {},
            {
              skipManagedPlugins: true,
            },
            {},
            {
              skipDefaultOptions: true,
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.plugins).toBeUndefined();
        });
      });

      describe("directives", () => {
        it("should use global.directives from mountOptions", () => {
          const focusDirective = {
            mounted() {},
          };

          const factory = testComponentFactory(MockComponent);

          factory(
            {},
            {
              global: {
                directives: {
                  focus: focusDirective,
                },
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.directives).toEqual({
            focus: focusDirective,
          });
        });

        it("should use global.directives from defaultMountOptions", () => {
          const focusDirective = {
            mounted() {},
          };

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              directives: {
                focus: focusDirective,
              },
            },
          }));

          factory();

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.directives).toEqual({
            focus: focusDirective,
          });
        });

        it("should merge global.directives", () => {
          const focusDirective = {
            mounted() {},
          };

          const tooltipDirective = {
            mounted() {},
          };

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              directives: {
                focus: focusDirective,
              },
            },
          }));

          factory(
            {},
            {
              global: {
                directives: {
                  tooltip: tooltipDirective,
                },
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.directives).toEqual({
            focus: focusDirective,
            tooltip: tooltipDirective,
          });
        });

        it("should allow mountOptions.global.directives to override default directives", () => {
          const oldDirective = {
            mounted() {},
          };

          const newDirective = {
            mounted() {},
          };

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              directives: {
                focus: oldDirective,
              },
            },
          }));

          factory(
            {},
            {
              global: {
                directives: {
                  focus: newDirective,
                },
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.directives).toEqual({
            focus: newDirective,
          });
        });

        it("should ignore default global.directives when skipDefaultOptions is true", () => {
          const focusDirective = {
            mounted() {},
          };

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              directives: {
                focus: focusDirective,
              },
            },
          }));

          factory(
            {},
            {},
            {},
            {
              skipDefaultOptions: true,
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.directives).toBeUndefined();
        });
      });

      describe("mixins", () => {
        it("should use global.mixins from mountOptions", () => {
          const mixinA = {
            created() {},
          };

          const factory = testComponentFactory(MockComponent);

          factory(
            {},
            {
              global: {
                mixins: [mixinA],
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.mixins).toHaveLength(1);
          expect(options.global.mixins[0]).toBe(mixinA);
        });

        it("should use global.mixins from defaultMountOptions", () => {
          const mixinA = {
            created() {},
          };

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              mixins: [mixinA],
            },
          }));

          factory();

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.mixins).toHaveLength(1);
          expect(options.global.mixins[0]).toBe(mixinA);
        });

        it("should concatenate global.mixins arrays", () => {
          const mixinA = {
            created() {},
          };

          const mixinB = {
            mounted() {},
          };

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              mixins: [mixinA],
            },
          }));

          factory(
            {},
            {
              global: {
                mixins: [mixinB],
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.mixins).toHaveLength(2);
          expect(options.global.mixins[0]).toBe(mixinA);
          expect(options.global.mixins[1]).toBe(mixinB);
        });

        it("should deduplicate identical mixin references", () => {
          const mixinA = {
            created() {},
          };

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              mixins: [mixinA],
            },
          }));

          factory(
            {},
            {
              global: {
                mixins: [mixinA],
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.mixins).toHaveLength(1);
          expect(options.global.mixins[0]).toBe(mixinA);
        });

        it("should ignore default global.mixins when skipDefaultOptions is true", () => {
          const mixinA = {
            created() {},
          };

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              mixins: [mixinA],
            },
          }));

          factory(
            {},
            {},
            {},
            {
              skipDefaultOptions: true,
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.mixins).toBeUndefined();
        });
      });

      describe("provide", () => {
        it("should use global.provide from mountOptions", () => {
          const factory = testComponentFactory(MockComponent);

          factory(
            {},
            {
              global: {
                provide: {
                  api: "test-api",
                },
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.provide).toEqual({
            api: "test-api",
          });
        });

        it("should use global.provide from defaultMountOptions", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              provide: {
                api: "default-api",
              },
            },
          }));

          factory();

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.provide).toEqual({
            api: "default-api",
          });
        });

        it("should merge global.provide objects", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              provide: {
                api: "default-api",
              },
            },
          }));

          factory(
            {},
            {
              global: {
                provide: {
                  store: "test-store",
                },
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.provide).toEqual({
            api: "default-api",
            store: "test-store",
          });
        });

        it("should allow mountOptions.global.provide to override defaults", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              provide: {
                api: "default-api",
              },
            },
          }));

          factory(
            {},
            {
              global: {
                provide: {
                  api: "test-api",
                },
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.provide).toEqual({
            api: "test-api",
          });
        });

        it("should ignore default global.provide when skipDefaultOptions is true", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              provide: {
                api: "default-api",
              },
            },
          }));

          factory(
            {},
            {},
            {},
            {
              skipDefaultOptions: true,
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.provide).toBeUndefined();
        });
      });

      describe("mocks", () => {
        it("should use global.mocks from mountOptions", () => {
          const factory = testComponentFactory(MockComponent);

          factory(
            {},
            {
              global: {
                mocks: {
                  $t: runner.fn(),
                },
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.mocks.$t).toBeDefined();
        });

        it("should use global.mocks from defaultMountOptions", () => {
          const tMock = runner.fn();

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              mocks: {
                $t: tMock,
              },
            },
          }));

          factory();

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.mocks.$t).toBe(tMock);
        });

        it.each(["positional", "object"])(
          "should create independent global.mocks functions for each mount (%s creation API)",
          (creationApi) => {
            const factory = createFactoryFromResolvers(creationApi, {
              defaultMountOptions: () => ({ global: { mocks: { $t: runner.fn() } } }),
            });

            factory();
            factory.withOptions({});

            const firstMocks = mockMount.mock.calls[0][1].global.mocks;
            const secondMocks = mockMount.mock.calls[1][1].global.mocks;

            expect(mockMount).toHaveBeenCalledTimes(2);
            expect(firstMocks).not.toBe(secondMocks);
            expect(firstMocks.$t).not.toBe(secondMocks.$t);

            firstMocks.$t("hello");
            expect(firstMocks.$t).toHaveBeenCalledWith("hello");
            expect(secondMocks.$t).not.toHaveBeenCalled();
          },
        );

        it("should merge global.mocks objects", () => {
          const tMock = runner.fn();
          const routerMock = runner.fn();

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              mocks: {
                $t: tMock,
              },
            },
          }));

          factory(
            {},
            {
              global: {
                mocks: {
                  $router: routerMock,
                },
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.mocks.$t).toBe(tMock);
          expect(options.global.mocks.$router).toBe(routerMock);
        });

        it("should allow mountOptions.global.mocks to override defaults", () => {
          const defaultMock = runner.fn();
          const overrideMock = runner.fn();

          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              mocks: {
                $t: defaultMock,
              },
            },
          }));

          factory(
            {},
            {
              global: {
                mocks: {
                  $t: overrideMock,
                },
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.mocks.$t).toBe(overrideMock);
        });

        it("should ignore default global.mocks when skipDefaultOptions is true", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              mocks: {
                $t: runner.fn(),
              },
            },
          }));

          factory(
            {},
            {},
            {},
            {
              skipDefaultOptions: true,
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.mocks).toBeUndefined();
        });
      });

      describe("stubs", () => {
        it("should merge global.stubs objects", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              stubs: {
                RouterLink: true,
              },
            },
          }));

          factory(
            {},
            {
              global: {
                stubs: {
                  RouterView: true,
                },
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.stubs.RouterLink).toBe(true);
          expect(options.global.stubs.RouterView).toBe(true);
        });

        it("should allow mountOptions.global.stubs to override defaults", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              stubs: {
                RouterLink: true,
              },
            },
          }));

          factory(
            {},
            {
              global: {
                stubs: {
                  RouterLink: false,
                },
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.stubs.RouterLink).toBe(false);
        });

        it("should concatenate global.stubs arrays", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              stubs: ["RouterLink"],
            },
          }));

          factory(
            {},
            {
              global: {
                stubs: ["RouterView"],
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.stubs).toEqual(["RouterLink", "RouterView"]);
        });

        it("should deduplicate global.stubs arrays", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              stubs: ["RouterLink"],
            },
          }));

          factory(
            {},
            {
              global: {
                stubs: ["RouterLink"],
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.stubs).toEqual(["RouterLink"]);
        });

        it("should replace stubs object with array when types differ", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              stubs: {
                RouterLink: true,
              },
            },
          }));

          factory(
            {},
            {
              global: {
                stubs: ["RouterView"],
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.stubs).toEqual(["RouterView"]);
        });

        it("should replace stubs array with object when types differ", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              stubs: ["RouterLink"],
            },
          }));

          factory(
            {},
            {
              global: {
                stubs: {
                  RouterView: true,
                },
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.stubs).toEqual({
            RouterView: true,
          });
        });

        it("should ignore default global.stubs when skipDefaultOptions is true", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              stubs: {
                RouterLink: true,
              },
            },
          }));

          factory(
            {},
            {},
            {},
            {
              skipDefaultOptions: true,
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.stubs).toBeUndefined();
        });
      });

      describe("config", () => {
        it("should use global.config from mountOptions", () => {
          const factory = testComponentFactory(MockComponent);

          factory(
            {},
            {
              global: {
                config: {
                  performance: true,
                },
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.config).toEqual({
            performance: true,
          });
        });

        it("should use global.config from defaultMountOptions", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              config: {
                performance: true,
              },
            },
          }));

          factory();

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.config).toEqual({
            performance: true,
          });
        });

        it("should merge global.config objects", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              config: {
                performance: true,
              },
            },
          }));

          factory(
            {},
            {
              global: {
                config: {
                  warnHandler: runner.fn(),
                },
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.config.performance).toBe(true);
          expect(options.global.config.warnHandler).toEqual(expect.any(Function));
        });

        it("should recursively merge nested config objects", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              config: {
                optionMergeStrategies: {
                  foo: "default",
                },
              },
            },
          }));

          factory(
            {},
            {
              global: {
                config: {
                  optionMergeStrategies: {
                    bar: "override",
                  },
                },
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.config.optionMergeStrategies).toEqual({
            foo: "default",
            bar: "override",
          });
        });

        it("should allow mountOptions.global.config to override defaults", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              config: {
                performance: false,
              },
            },
          }));

          factory(
            {},
            {
              global: {
                config: {
                  performance: true,
                },
              },
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.config).toEqual({
            performance: true,
          });
        });

        it("should ignore default global.config when skipDefaultOptions is true", () => {
          const factory = testComponentFactory(MockComponent, undefined, () => ({
            global: {
              config: {
                performance: true,
              },
            },
          }));

          factory(
            {},
            {},
            {},
            {
              skipDefaultOptions: true,
            },
          );

          const [, options] = mockMount.mock.calls[0];

          expect(options.global.config).toBeUndefined();
        });
      });
    });
  });
});
