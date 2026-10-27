import { setupFactoryTestContext } from "./utils/setupFactoryTestContext.js";

const runner = typeof vi !== "undefined" ? vi : jest;

describe("Plugin Instance Dependencies", () => {
  let MockComponent;
  let mockMount;
  let createTestFramework;
  let createPluginInstance;
  let fromPluginInstance;
  let withPluginInstance;

  beforeEach(async () => {
    const ctx = await setupFactoryTestContext(runner);

    ({
      MockComponent,
      mockMount,
      createTestFramework,
      createPluginInstance,
      fromPluginInstance,
      withPluginInstance,
    } = ctx);
  });

  /*
   * Creates a minimal plugin module compatible with the public
   * TestForge plugin contract.
   */
  const createPluginModule = (name, definition) => ({
    getName: () => name,
    getDefinition: () => definition,
  });

  /*
   * Creates a test component factory with a dedicated preset.
   * The manifest order is intentionally controlled by each test.
   */
  const createDependencyFactory = (modules, defaults = {}) => {
    const preset = {
      manifest: modules.map((module) => ({
        module,
        enabled: true,
      })),
      defaults,
    };

    return createTestFramework({ preset }).testComponentFactory;
  };

  describe("Dependency Resolution", () => {
    it("should create a dependency before its consumer and resolve nested instance references", () => {
      const creationOrder = [];

      const providerInstance = {
        id: "provider-instance",
        install() {},
      };

      const providerCreate = runner.fn(() => {
        creationOrder.push("provider");
        return providerInstance;
      });

      const consumerCreate = runner.fn(() => {
        creationOrder.push("consumer");

        return {
          install() {},
        };
      });

      const consumerPlugin = createPluginModule("consumer", {
        create: consumerCreate,
      });

      const providerPlugin = createPluginModule("provider", {
        supportsInstanceReferences: true,
        create: providerCreate,
      });

      // The consumer is declared before its dependency.
      const testComponentFactory = createDependencyFactory([consumerPlugin, providerPlugin]);

      const referenceResolver = runner.fn((instance) => instance);

      const factory = testComponentFactory(MockComponent);

      factory(
        {},
        {
          plugins: {
            consumer: {
              nested: {
                dependencies: [fromPluginInstance("provider", referenceResolver)],
              },
            },
          },
        },
      );

      expect(creationOrder).toEqual(["provider", "consumer"]);

      expect(referenceResolver).toHaveBeenCalledTimes(1);
      expect(referenceResolver).toHaveBeenCalledWith(providerInstance);

      expect(consumerCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          nested: {
            dependencies: [providerInstance],
          },
        }),
      );

      const [, options] = mockMount.mock.calls[0];

      expect(options.global.plugins).toEqual([
        providerInstance,
        consumerCreate.mock.results[0].value,
      ]);
    });

    it("should resolve transitive dependencies between plugins", () => {
      const creationOrder = [];

      const providerInstance = {
        id: "provider",
        install() {},
      };

      const middleInstance = {
        id: "middle",
        install() {},
      };

      const consumerInstance = {
        id: "consumer",
        install() {},
      };

      const providerCreate = runner.fn(() => {
        creationOrder.push("provider");

        return providerInstance;
      });

      const middleCreate = runner.fn(() => {
        creationOrder.push("middle");

        return middleInstance;
      });

      const consumerCreate = runner.fn(() => {
        creationOrder.push("consumer");

        return consumerInstance;
      });

      const testComponentFactory = createDependencyFactory([
        createPluginModule("consumer", {
          create: consumerCreate,
        }),
        createPluginModule("middle", {
          supportsInstanceReferences: true,
          create: middleCreate,
        }),
        createPluginModule("provider", {
          supportsInstanceReferences: true,
          create: providerCreate,
        }),
      ]);

      const factory = testComponentFactory(MockComponent);

      factory(
        {},
        {
          plugins: {
            consumer: {
              dependency: fromPluginInstance("middle", (instance) => instance),
            },
            middle: {
              dependency: fromPluginInstance("provider", (instance) => instance),
            },
          },
        },
      );

      expect(creationOrder).toEqual(["provider", "middle", "consumer"]);

      expect(middleCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          dependency: providerInstance,
        }),
      );

      expect(consumerCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          dependency: middleInstance,
        }),
      );

      const [, options] = mockMount.mock.calls[0];

      expect(options.global.plugins).toEqual([providerInstance, middleInstance, consumerInstance]);
    });
  });

  describe("Runtime Isolation", () => {
    it("should resolve plugin instances independently across factory calls", () => {
      let instanceCounter = 0;

      const providerCreate = runner.fn(() => ({
        id: ++instanceCounter,
        install() {},
      }));

      const consumerCreate = runner.fn(() => ({
        install() {},
      }));

      const testComponentFactory = createDependencyFactory([
        createPluginModule("consumer", {
          create: consumerCreate,
        }),
        createPluginModule("provider", {
          supportsInstanceReferences: true,
          create: providerCreate,
        }),
      ]);

      const reference = fromPluginInstance("provider", (instance) => instance);

      const defaultMountOptions = {
        plugins: {
          consumer: {
            nested: {
              dependency: reference,
            },
          },
        },
      };

      const factory = testComponentFactory(MockComponent, {}, defaultMountOptions);

      factory();
      factory();

      expect(providerCreate).toHaveBeenCalledTimes(2);
      expect(consumerCreate).toHaveBeenCalledTimes(2);

      const firstProvider = providerCreate.mock.results[0].value;
      const secondProvider = providerCreate.mock.results[1].value;

      const firstConsumerOptions = consumerCreate.mock.calls[0][0];
      const secondConsumerOptions = consumerCreate.mock.calls[1][0];

      expect(firstProvider).not.toBe(secondProvider);

      expect(firstConsumerOptions.nested.dependency).toBe(firstProvider);
      expect(secondConsumerOptions.nested.dependency).toBe(secondProvider);

      expect(firstConsumerOptions.nested.dependency).not.toBe(
        secondConsumerOptions.nested.dependency,
      );

      // Resolving one mount must not modify the shared defaults.
      expect(defaultMountOptions.plugins.consumer.nested.dependency).toBe(reference);

      const [, firstMountOptions] = mockMount.mock.calls[0];
      const [, secondMountOptions] = mockMount.mock.calls[1];

      expect(firstMountOptions.global.plugins).toContain(firstProvider);
      expect(secondMountOptions.global.plugins).toContain(secondProvider);

      expect(firstMountOptions.global.plugins).not.toContain(secondProvider);
      expect(secondMountOptions.global.plugins).not.toContain(firstProvider);
    });
  });

  describe("Dependency Validation", () => {
    it("should reject dependencies on disabled plugins before creating any plugins", () => {
      const providerCreate = runner.fn(() => ({
        install() {},
      }));

      const consumerCreate = runner.fn(() => ({
        install() {},
      }));

      const testComponentFactory = createDependencyFactory([
        createPluginModule("consumer", {
          create: consumerCreate,
        }),
        createPluginModule("provider", {
          supportsInstanceReferences: true,
          create: providerCreate,
        }),
      ]);

      const factory = testComponentFactory(MockComponent);

      expect(() => {
        factory(
          {},
          {
            plugins: {
              consumer: {
                dependency: fromPluginInstance("provider", (instance) => instance),
              },
              provider: false,
            },
          },
        );
      }).toThrow(/inactive plugin/i);

      expect(providerCreate).not.toHaveBeenCalled();
      expect(consumerCreate).not.toHaveBeenCalled();
      expect(mockMount).not.toHaveBeenCalled();
    });

    it("should reject circular plugin dependencies before creating any plugins", () => {
      const firstCreate = runner.fn(() => ({
        install() {},
      }));

      const secondCreate = runner.fn(() => ({
        install() {},
      }));

      const testComponentFactory = createDependencyFactory([
        createPluginModule("first", {
          supportsInstanceReferences: true,
          create: firstCreate,
        }),
        createPluginModule("second", {
          supportsInstanceReferences: true,
          create: secondCreate,
        }),
      ]);

      const factory = testComponentFactory(MockComponent);

      expect(() => {
        factory(
          {},
          {
            plugins: {
              first: {
                dependency: fromPluginInstance("second", (instance) => instance),
              },
              second: {
                dependency: fromPluginInstance("first", (instance) => instance),
              },
            },
          },
        );
      }).toThrow(/circular.*dependenc/i);

      expect(firstCreate).not.toHaveBeenCalled();
      expect(secondCreate).not.toHaveBeenCalled();
      expect(mockMount).not.toHaveBeenCalled();
    });

    it("should reject references to plugins without instance reference support", () => {
      const providerCreate = runner.fn(() => ({
        install() {},
      }));

      const consumerCreate = runner.fn(() => ({
        install() {},
      }));

      const testComponentFactory = createDependencyFactory([
        createPluginModule("consumer", {
          create: consumerCreate,
        }),
        createPluginModule("provider", {
          create: providerCreate,
          // supportsInstanceReferences is intentionally omitted.
        }),
      ]);

      const factory = testComponentFactory(MockComponent);

      expect(() => {
        factory(
          {},
          {
            plugins: {
              consumer: {
                dependency: fromPluginInstance("provider", (instance) => instance),
              },
            },
          },
        );
      }).toThrow(/does not support instance references/i);

      expect(providerCreate).not.toHaveBeenCalled();
      expect(consumerCreate).not.toHaveBeenCalled();
      expect(mockMount).not.toHaveBeenCalled();
    });
  });

  describe("Lifecycle Hooks", () => {
    it("should resolve instance references before invoking beforeCreate", () => {
      const providerInstance = {
        id: "provider-instance",
        install() {},
      };

      const consumerInstance = {
        install() {},
      };

      const creationOrder = [];

      const providerCreate = runner.fn(() => {
        creationOrder.push("provider.create");
        return providerInstance;
      });

      const consumerBeforeCreate = runner.fn((ctx, options) => {
        creationOrder.push("consumer.beforeCreate");

        return {
          ...options,
          derivedValue: options.dependency.id,
        };
      });

      const consumerCreate = runner.fn(() => {
        creationOrder.push("consumer.create");
        return consumerInstance;
      });

      const testComponentFactory = createDependencyFactory([
        createPluginModule("consumer", {
          beforeCreate: consumerBeforeCreate,
          create: consumerCreate,
        }),
        createPluginModule("provider", {
          supportsInstanceReferences: true,
          create: providerCreate,
        }),
      ]);

      const reference = fromPluginInstance("provider", (instance) => instance);

      const factory = testComponentFactory(MockComponent);

      factory(
        {},
        {
          plugins: {
            consumer: {
              dependency: reference,
            },
          },
        },
      );

      expect(creationOrder).toEqual([
        "provider.create",
        "consumer.beforeCreate",
        "consumer.create",
      ]);

      expect(consumerBeforeCreate).toHaveBeenCalledTimes(1);
      expect(consumerCreate).toHaveBeenCalledTimes(1);

      const [hookContext, hookOptions] = consumerBeforeCreate.mock.calls[0];

      expect(hookContext).toBeDefined();
      expect(hookOptions.dependency).toBe(providerInstance);

      const [createOptions] = consumerCreate.mock.calls[0];

      expect(createOptions.dependency).toBe(providerInstance);
      expect(createOptions.derivedValue).toBe("provider-instance");
    });

    it("should invoke lifecycle hooks in dependency creation order", () => {
      const events = [];

      const providerInstance = {
        id: "provider",
        install() {},
      };

      const consumerInstance = {
        id: "consumer",
        install() {},
      };

      const providerAfterCreate = runner.fn((instance, ctx) => {
        events.push("provider.afterCreate");

        expect(instance).toBe(providerInstance);
        expect(ctx).toBeDefined();
      });

      const consumerAfterCreate = runner.fn((instance, ctx) => {
        events.push("consumer.afterCreate");

        expect(instance).toBe(consumerInstance);
        expect(ctx).toBeDefined();
      });

      const testComponentFactory = createDependencyFactory([
        createPluginModule("consumer", {
          beforeCreate: runner.fn((ctx, options) => {
            events.push("consumer.beforeCreate");
            return options;
          }),

          create: runner.fn(() => {
            events.push("consumer.create");
            return consumerInstance;
          }),

          afterCreate: consumerAfterCreate,
        }),

        createPluginModule("provider", {
          supportsInstanceReferences: true,

          create: runner.fn(() => {
            events.push("provider.create");
            return providerInstance;
          }),

          afterCreate: providerAfterCreate,
        }),
      ]);

      const factory = testComponentFactory(MockComponent);

      factory(
        {},
        {
          plugins: {
            consumer: {
              dependency: fromPluginInstance("provider", (instance) => instance),
            },
          },
        },
      );

      expect(events).toEqual([
        "provider.create",
        "provider.afterCreate",
        "consumer.beforeCreate",
        "consumer.create",
        "consumer.afterCreate",
      ]);

      expect(providerAfterCreate).toHaveBeenCalledTimes(1);
      expect(consumerAfterCreate).toHaveBeenCalledTimes(1);

      const [, options] = mockMount.mock.calls[0];

      expect(options.global.plugins).toEqual([providerInstance, consumerInstance]);
    });
  });

  describe("Pre-created Plugin Instances", () => {
    it("should resolve dependencies to an instance provided via withPluginInstance", () => {
      const providedInstance = {
        id: "pre-created-provider",
        install() {},
      };

      const createNewInstance = runner.fn(() => ({
        id: "new-provider",
        install() {},
      }));

      const providerCreate = runner.fn((options) =>
        createPluginInstance(createNewInstance, options),
      );

      const consumerCreate = runner.fn(() => ({
        install() {},
      }));

      const referenceResolver = runner.fn((instance) => instance);

      const testComponentFactory = createDependencyFactory([
        createPluginModule("consumer", {
          create: consumerCreate,
        }),

        createPluginModule("provider", {
          supportsInstanceReferences: true,
          create: providerCreate,
        }),
      ]);

      const factory = testComponentFactory(MockComponent);

      factory(
        {},
        {
          plugins: {
            consumer: {
              dependency: fromPluginInstance("provider", referenceResolver),
            },
            provider: {
              ...withPluginInstance(providedInstance),
            },
          },
        },
      );

      // The provided instance must be reused instead of creating a new one.
      expect(providerCreate).toHaveBeenCalledTimes(1);
      expect(createNewInstance).not.toHaveBeenCalled();
      expect(providerCreate.mock.results[0].value).toBe(providedInstance);

      // Dependency references must resolve to the provided instance.
      expect(referenceResolver).toHaveBeenCalledTimes(1);
      expect(referenceResolver).toHaveBeenCalledWith(providedInstance);

      const [consumerOptions] = consumerCreate.mock.calls[0];

      expect(consumerOptions.dependency).toBe(providedInstance);

      // The same instance must be installed into the mounted component.
      const [, mountOptions] = mockMount.mock.calls[0];

      expect(mountOptions.global.plugins).toContain(providedInstance);
    });

    it("should reject plugin instance references passed to withPluginInstance", () => {
      const providerCreate = runner.fn(() => ({
        install() {},
      }));

      const testComponentFactory = createDependencyFactory([
        createPluginModule("provider", {
          supportsInstanceReferences: true,
          create: providerCreate,
        }),
      ]);

      const factory = testComponentFactory(MockComponent);

      const reference = fromPluginInstance("provider", (instance) => instance);

      expect(() => {
        factory(
          {},
          {},
          {},
          {
            plugins: {
              provider: {
                ...withPluginInstance(reference),
              },
            },
          },
        );
      }).toThrow(/withPluginInstance\(\) requires a pre-created plugin instance/);

      expect(providerCreate).not.toHaveBeenCalled();
      expect(mockMount).not.toHaveBeenCalled();
    });
  });

  describe("Configuration Layering", () => {
    it("should resolve instance references from the effective plugin configuration", () => {
      const providerInstance = {
        id: "provider-instance",
        install() {},
      };

      const providerCreate = runner.fn(() => providerInstance);

      const consumerCreate = runner.fn(() => ({
        install() {},
      }));

      // Track which configuration layer supplies the resolved reference.
      const presetResolver = runner.fn((instance) => instance.id);
      const factoryResolver = runner.fn((instance) => instance.id);
      const mountResolver = runner.fn((instance) => instance.id);

      // Preset defaults provide the base plugin configuration.
      const testComponentFactory = createDependencyFactory(
        [
          createPluginModule("consumer", {
            create: consumerCreate,
          }),

          createPluginModule("provider", {
            supportsInstanceReferences: true,
            create: providerCreate,
          }),
        ],
        {
          consumer: () => ({
            source: "preset",
            presetOnly: true,
            dependency: fromPluginInstance("provider", presetResolver),
          }),
        },
      );

      // Factory-level options override preset values while preserving
      // unrelated preset defaults.
      const factory = testComponentFactory(
        MockComponent,
        {},
        {
          plugins: {
            consumer: {
              source: "factory",
              factoryOnly: true,
              dependency: fromPluginInstance("provider", factoryResolver),
            },
          },
        },
      );

      // Mount-level options replace the factory-level plugin configuration.
      // Extra options are then merged into the effective configuration.
      factory(
        {},
        {
          plugins: {
            consumer: {
              source: "mount",
              mountOnly: true,
              dependency: fromPluginInstance("provider", mountResolver),
            },
          },
        },
        {},
        {
          plugins: {
            consumer: {
              source: "extra",
              extraOnly: true,
            },
          },
        },
      );

      expect(consumerCreate).toHaveBeenCalledTimes(1);

      const [consumerOptions] = consumerCreate.mock.calls[0];

      // The effective configuration retains preset defaults, replaces
      // factory-level options, and applies extra options on top.
      expect(consumerOptions).toEqual(
        expect.objectContaining({
          source: "extra",
          presetOnly: true,
          mountOnly: true,
          extraOnly: true,
          dependency: "provider-instance",
        }),
      );

      // Factory-level options must not survive mount-level replacement.
      expect(consumerOptions.factoryOnly).toBeUndefined();

      // References from overridden configuration layers must not be resolved.
      expect(presetResolver).not.toHaveBeenCalled();
      expect(factoryResolver).not.toHaveBeenCalled();

      // Only the reference from the effective configuration is resolved,
      // using the actual instance created by the provider plugin.
      expect(mountResolver).toHaveBeenCalledTimes(1);
      expect(mountResolver).toHaveBeenCalledWith(providerInstance);
    });

    it("should resolve instance references declared in preset defaults", () => {
      const providerInstance = {
        id: "provider-instance",
        install() {},
      };

      const providerCreate = runner.fn(() => providerInstance);

      const consumerCreate = runner.fn(() => ({
        install() {},
      }));

      const referenceResolver = runner.fn((instance) => instance);

      const testComponentFactory = createDependencyFactory(
        [
          createPluginModule("consumer", {
            create: consumerCreate,
          }),
          createPluginModule("provider", {
            supportsInstanceReferences: true,
            create: providerCreate,
          }),
        ],
        {
          consumer: () => ({
            dependency: fromPluginInstance("provider", referenceResolver),
          }),
        },
      );

      const factory = testComponentFactory(MockComponent);

      // No plugin overrides: the dependency comes entirely from preset defaults.
      factory();

      expect(providerCreate).toHaveBeenCalledTimes(1);
      expect(consumerCreate).toHaveBeenCalledTimes(1);

      expect(referenceResolver).toHaveBeenCalledTimes(1);
      expect(referenceResolver).toHaveBeenCalledWith(providerInstance);

      const [consumerOptions] = consumerCreate.mock.calls[0];

      expect(consumerOptions.dependency).toBe(providerInstance);
    });

    it("should discard replaced instance references before dependency validation", () => {
      const providerCreate = runner.fn(() => ({
        id: "provider",
        install() {},
      }));

      const consumerCreate = runner.fn(() => ({
        install() {},
      }));

      const referenceResolver = runner.fn((instance) => instance);

      const testComponentFactory = createDependencyFactory([
        createPluginModule("consumer", {
          create: consumerCreate,
        }),

        createPluginModule("provider", {
          supportsInstanceReferences: true,
          create: providerCreate,
        }),
      ]);

      const factory = testComponentFactory(
        MockComponent,
        {},
        {
          plugins: {
            consumer: {
              dependency: fromPluginInstance("provider", referenceResolver),
            },
          },
        },
      );

      expect(() => {
        factory(
          {},
          {
            plugins: {
              consumer: {
                value: "replaced",
              },
              provider: false,
            },
          },
        );
      }).not.toThrow();

      expect(providerCreate).not.toHaveBeenCalled();
      expect(referenceResolver).not.toHaveBeenCalled();

      expect(consumerCreate).toHaveBeenCalledTimes(1);

      const [consumerOptions] = consumerCreate.mock.calls[0];

      expect(consumerOptions.value).toBe("replaced");
      expect(consumerOptions.dependency).toBeUndefined();

      expect(mockMount).toHaveBeenCalledTimes(1);
    });

    it("should prioritize instance references from extraOptions.plugins", () => {
      const providerInstance = {
        id: "provider-instance",
        token: "provider-token",
        install() {},
      };

      const providerCreate = runner.fn(() => providerInstance);

      const consumerCreate = runner.fn(() => ({
        install() {},
      }));

      const defaultResolver = runner.fn((instance) => instance.id);
      const overrideResolver = runner.fn((instance) => instance.token);

      const testComponentFactory = createDependencyFactory([
        createPluginModule("consumer", {
          create: consumerCreate,
        }),

        createPluginModule("provider", {
          supportsInstanceReferences: true,
          create: providerCreate,
        }),
      ]);

      const factory = testComponentFactory(
        MockComponent,
        {},
        {
          plugins: {
            consumer: {
              dependency: fromPluginInstance("provider", defaultResolver),
              unchanged: "preserved",
            },
          },
        },
      );

      factory(
        {},
        {},
        {},
        {
          plugins: {
            consumer: {
              dependency: fromPluginInstance("provider", overrideResolver),
            },
          },
        },
      );

      const [consumerOptions] = consumerCreate.mock.calls[0];

      expect(consumerOptions.dependency).toBe("provider-token");
      expect(consumerOptions.unchanged).toBe("preserved");

      expect(defaultResolver).not.toHaveBeenCalled();

      expect(overrideResolver).toHaveBeenCalledTimes(1);
      expect(overrideResolver).toHaveBeenCalledWith(providerInstance);
    });
  });

  describe("Managed Plugins Skipping", () => {
    it("should skip dependency resolution when managed plugins are disabled", () => {
      const providerCreate = runner.fn(() => ({
        install() {},
      }));

      const consumerCreate = runner.fn(() => ({
        install() {},
      }));

      const referenceResolver = runner.fn((instance) => instance);

      const testComponentFactory = createDependencyFactory([
        createPluginModule("consumer", {
          create: consumerCreate,
        }),
        createPluginModule("provider", {
          supportsInstanceReferences: true,
          create: providerCreate,
        }),
      ]);

      const factory = testComponentFactory(MockComponent);

      factory(
        {},
        {
          skipManagedPlugins: true,
          plugins: {
            consumer: {
              dependency: fromPluginInstance("provider", referenceResolver),
            },
          },
        },
      );

      expect(providerCreate).not.toHaveBeenCalled();
      expect(consumerCreate).not.toHaveBeenCalled();

      expect(referenceResolver).not.toHaveBeenCalled();

      expect(mockMount).toHaveBeenCalledTimes(1);
    });
  });
});
