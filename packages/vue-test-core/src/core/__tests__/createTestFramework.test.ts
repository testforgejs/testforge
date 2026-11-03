import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestFramework } from "../createTestFramework.js";
import { mergeComponentData } from "../../utils/mergeComponentData.js";
import { createPipelineContext } from "../../pipeline/core/createPipelineContext.js";
import { createPipeline } from "../../pipeline/core/createPipeline.js";
import { createMountPipeline } from "../../pipeline/mount/createMountPipeline.js";
import { mountWithPlugins } from "../mountWithPlugins.js";

import type {
  ComponentFactoryConfig,
  ComponentFactoryExtraOptions,
  ComponentFactoryOptions,
  CreateTestFrameworkOptions,
} from "../../types.js";

vi.mock("../../utils/mergeComponentData.js", () => ({
  mergeComponentData: vi.fn((x) => x),
}));

vi.mock("../../pipeline/core/createPipelineContext.js", () => ({
  createPipelineContext: vi.fn(() => ({ ctx: true })),
}));

vi.mock("../../pipeline/core/createPipeline.js", () => ({
  createPipeline: vi.fn(() => ({
    run: vi.fn((ctx) => ctx),
  })),
}));

vi.mock("../../pipeline/mount/createMountPipeline.js", () => ({
  createMountPipeline: vi.fn(() => "mount-pipeline"),
}));

vi.mock("../mountWithPlugins.js", () => ({
  mountWithPlugins: vi.fn(() => "wrapper"),
}));

describe("createTestFramework → testComponentFactory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const component = { name: "Comp" };

  describe("props and slots merging", () => {
    it("merges props and slots via mergeComponentData", () => {
      vi.mocked(mergeComponentData)
        .mockReturnValueOnce({ mergedProps: true })
        .mockReturnValueOnce({ mergedSlots: true });

      const { testComponentFactory } = createTestFramework();
      const factory = testComponentFactory(
        {},
        { a: 1 },
        { props: { b: 2 }, slots: { s: 1 } },
        { s: 2 },
      );

      factory({ c: 3 }, { props: { d: 4 }, slots: { s: 3 } }, { s: 4 });

      // First call — props
      expect(mergeComponentData).toHaveBeenNthCalledWith(1, {
        defaultMountData: { b: 2 },
        defaultData: { a: 1 },
        mountData: { d: 4 },
        directData: { c: 3 },
        skipDefault: false,
        skipOptions: false,
      });

      // Second call — slots
      expect(mergeComponentData).toHaveBeenNthCalledWith(2, {
        defaultMountData: { s: 1 },
        defaultData: { s: 2 },
        mountData: { s: 3 },
        directData: { s: 4 },
        skipDefault: false,
        skipOptions: false,
      });
    });

    it("should pass skip flags to mergeComponentData correctly", () => {
      const { testComponentFactory } = createTestFramework();

      const factory = testComponentFactory(component);

      factory(
        {},
        {},
        {},
        {
          skipDefaultProps: true,
          skipDefaultSlots: true,
          skipDefaultOptions: true,
        },
      );

      expect(mergeComponentData).toHaveBeenCalledWith(
        expect.objectContaining({
          skipDefault: true,
          skipOptions: true,
        }),
      );
    });
  });

  describe("mount context creation", () => {
    it("should create mount context with correct arguments", () => {
      const presets = { abcd: { manifest: [], defaults: {} } };
      const { testComponentFactory } = createTestFramework({ presets });

      const factory = testComponentFactory(component);

      factory({}, {}, {}, { presetKey: "abcd" });

      expect(createPipelineContext).toHaveBeenCalledWith({
        defaultMountOptions: {},
        mountOptions: {},
        extraOptions: { presetKey: "abcd" },
        presets,
      });
    });
  });

  describe("pipeline execution", () => {
    it("should run pipeline before mounting", () => {
      const { testComponentFactory } = createTestFramework();

      const factory = testComponentFactory(component);

      factory();

      const pipeline = vi.mocked(createPipeline).mock.results[0].value;

      expect(createMountPipeline).toHaveBeenCalledWith({ ctx: true });
      expect(pipeline.run).toHaveBeenCalledWith({ ctx: true });
    });
  });

  describe("mounting phase", () => {
    it("should call mountWithPlugins with merged data and runtime options", () => {
      vi.mocked(mergeComponentData)
        .mockReturnValueOnce({ finalProps: 123 })
        .mockReturnValueOnce({ finalSlots: 456 });

      const { testComponentFactory } = createTestFramework({
        shallowByDefault: true,
      });

      const factory = testComponentFactory({}, {}, {}, {});

      factory({}, {}, {});

      expect(mountWithPlugins).toHaveBeenCalledWith(
        {},
        expect.any(Object),
        {
          props: { finalProps: 123 },
          slots: { finalSlots: 456 },
        },
        {
          shallowByDefault: true,
        },
      );
    });

    it("should return mount result", () => {
      const { testComponentFactory } = createTestFramework();

      const factory = testComponentFactory(component);

      const result = factory();

      expect(result).toBe("wrapper");
    });
  });

  describe("runtime mount options", () => {
    it("should pass shallowByDefault=false by default", () => {
      const { testComponentFactory } = createTestFramework();

      const factory = testComponentFactory(component);

      factory();

      expect(mountWithPlugins).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        {
          shallowByDefault: false,
        },
      );
    });

    it("should pass shallowByDefault=true when configured", () => {
      const { testComponentFactory } = createTestFramework({
        shallowByDefault: true,
      });

      const factory = testComponentFactory(component);

      factory();

      expect(mountWithPlugins).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        {
          shallowByDefault: true,
        },
      );
    });
  });

  describe("validate options", () => {
    describe("createTestFramework validation", () => {
      it("should throw an error when shallowByDefault is not a boolean", () => {
        expect(() =>
          createTestFramework({
            shallowByDefault: "true",
          } as unknown as CreateTestFrameworkOptions),
        ).toThrow('"shallowByDefault" must be a boolean');
      });

      it("should throw an error when options is not a plain object", () => {
        expect(() => createTestFramework(123 as unknown as CreateTestFrameworkOptions)).toThrow(
          "createTestFramework options must be a plain object.",
        );
      });
    });

    describe("testComponentFactory validation", () => {
      it("should throw when component is not an object", () => {
        const { testComponentFactory } = createTestFramework();

        expect(() => {
          testComponentFactory(null as unknown as CreateTestFrameworkOptions);
        }).toThrow("testComponentFactory() requires a valid Vue component");
      });

      it.each([
        ["defaultProps", 123],
        ["defaultProps", []],
        ["defaultProps", "foo"],
      ])("should throw when %s is invalid", (_name, value) => {
        const { testComponentFactory } = createTestFramework();

        expect(() => {
          testComponentFactory(component, value);
        }).toThrow('"defaultProps" must be a plain object');
      });

      it.each([
        ["defaultMountOptions", 123],
        ["defaultMountOptions", []],
        ["defaultMountOptions", "foo"],
      ])("should throw when %s is invalid", (_name, value) => {
        const { testComponentFactory } = createTestFramework();

        expect(() => {
          testComponentFactory(component, {}, value as unknown as ComponentFactoryOptions);
        }).toThrow('"defaultMountOptions" must be a plain object');
      });

      it.each([
        ["defaultSlots", 123],
        ["defaultSlots", []],
        ["defaultSlots", "foo"],
      ])("should throw when %s is invalid", (_name, value) => {
        const { testComponentFactory } = createTestFramework();

        expect(() => {
          testComponentFactory(component, {}, {}, value);
        }).toThrow('"defaultSlots" must be a plain object');
      });

      it("should not throw for valid arguments", () => {
        const { testComponentFactory } = createTestFramework();

        expect(() => {
          testComponentFactory(
            component,
            {},
            {
              props: {},
              slots: {},
            },
            {},
          );
        }).not.toThrow();
      });

      describe("defaultMountOptions plugin validation", () => {
        it("should warn when a plugin option is placed at the root of defaultMountOptions", () => {
          const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

          const presets = {
            default: {
              manifest: [
                {
                  module: {
                    getName: () => "i18n",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          const { testComponentFactory } = createTestFramework({ presets });

          expect(() => {
            // Intentionally bypass type safety to verify runtime DX warning.
            // Plugin options must be placed under defaultMountOptions.plugins.
            // @ts-expect-error testing invalid configuration
            testComponentFactory(component, {}, { i18n: {} });
          }).not.toThrow();

          expect(warnSpy).toHaveBeenCalledTimes(1);

          expect(warnSpy.mock.calls[0][0]).toContain(
            'Detected plugin option "i18n" at the root of "defaultMountOptions"',
          );

          expect(warnSpy.mock.calls[0][0]).toContain(
            'Did you mean to use "defaultMountOptions.plugins.i18n"?',
          );
        });

        it("should not warn when plugin options are placed under defaultMountOptions.plugins", () => {
          const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

          const presets = {
            default: {
              manifest: [
                {
                  module: {
                    getName: () => "i18n",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          const { testComponentFactory } = createTestFramework({ presets });

          testComponentFactory(component, {}, {
            plugins: {
              i18n: {},
            },
          } as unknown as ComponentFactoryOptions);

          expect(warnSpy).not.toHaveBeenCalled();
        });

        it("should ignore unknown root options", () => {
          const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

          const presets = {
            default: {
              manifest: [
                {
                  module: {
                    getName: () => "i18n",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
                {
                  module: {
                    getName: () => "pinia",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          const { testComponentFactory } = createTestFramework({ presets });

          testComponentFactory(component, {}, { foo: {} } as unknown as ComponentFactoryOptions);

          expect(warnSpy).not.toHaveBeenCalled();
        });

        it("should not warn when the plugin is configured both at the root and under plugins", () => {
          const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

          const presets = {
            default: {
              manifest: [
                {
                  module: {
                    getName: () => "i18n",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          const { testComponentFactory } = createTestFramework({ presets });

          testComponentFactory(component, {}, {
            i18n: {},
            plugins: {
              i18n: {},
            },
          } as unknown as ComponentFactoryOptions);

          expect(warnSpy).not.toHaveBeenCalled();
        });

        it("should use the default preset for positional factory validation", () => {
          const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

          const presets = {
            default: {
              manifest: [
                {
                  module: {
                    getName: () => "i18n",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
            custom: {
              manifest: [
                {
                  module: {
                    getName: () => "pinia",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          const { testComponentFactory } = createTestFramework({ presets });

          expect(() => {
            testComponentFactory(component, {}, { i18n: {} } as unknown as ComponentFactoryOptions);
          }).not.toThrow();

          expect(warnSpy).toHaveBeenCalledTimes(1);

          expect(warnSpy.mock.calls[0][0]).toContain('"defaultMountOptions"');
        });

        describe("factory-level preset validation", () => {
          const presets = {
            default: {
              manifest: [
                {
                  module: {
                    getName: () => "i18n",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
            admin: {
              manifest: [
                {
                  module: {
                    getName: () => "pinia",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          it("should use the factory preset for defaultMountOptions validation", () => {
            const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

            try {
              const { testComponentFactory } = createTestFramework({ presets });

              // Pinia is registered in "admin", but not in "default".
              testComponentFactory.withOptions({
                component,
                presetKey: "admin",
                defaultMountOptions: {
                  pinia: {},
                } as unknown as ComponentFactoryOptions,
              });

              expect(warnSpy).toHaveBeenCalledTimes(1);

              expect(warnSpy.mock.calls[0][0]).toContain(
                'Detected plugin option "pinia" at the root of "defaultMountOptions"',
              );

              expect(warnSpy.mock.calls[0][0]).toContain(
                'Did you mean to use "defaultMountOptions.plugins.pinia"?',
              );
            } finally {
              warnSpy.mockRestore();
            }
          });

          it("should not warn about plugins registered only in other presets", () => {
            const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

            try {
              const { testComponentFactory } = createTestFramework({ presets });

              // I18n is registered only in "default", not in "admin".
              testComponentFactory.withOptions({
                component,
                presetKey: "admin",
                defaultMountOptions: {
                  i18n: {},
                } as unknown as ComponentFactoryOptions,
              });

              expect(warnSpy).not.toHaveBeenCalled();
            } finally {
              warnSpy.mockRestore();
            }
          });
        });
      });

      it("should reject an unknown preset key in factory config", () => {
        const presets = {
          default: {
            manifest: [],
            defaults: {},
          },
          admin: {
            manifest: [],
            defaults: {},
          },
        };

        const { testComponentFactory } = createTestFramework({ presets });

        expect(() => {
          testComponentFactory(component, {}, {}, {}, { presetKey: "unknown" });
        }).toThrow('Preset "unknown" is not registered.');

        // Validation must happen before creating the mount pipeline.
        expect(createPipelineContext).not.toHaveBeenCalled();
        expect(mountWithPlugins).not.toHaveBeenCalled();
      });

      it.each([
        { description: "null", value: null },
        { description: "a number", value: 123 },
        { description: "a string", value: "admin" },
        { description: "an array", value: [] },
      ])("should reject $description as factory config", ({ value }) => {
        const { testComponentFactory } = createTestFramework();

        expect(() => {
          testComponentFactory(component, {}, {}, {}, value as ComponentFactoryConfig);
        }).toThrow('"config" must be a plain object.');
      });
    });

    describe("component factory validation", () => {
      it.each([
        ["props", 123],
        ["props", []],
        ["props", "foo"],
      ])("should throw when %s is invalid", (_name, value) => {
        const { testComponentFactory } = createTestFramework();
        const factory = testComponentFactory(component);

        expect(() => {
          factory(value);
        }).toThrow('"props" must be a plain object');
      });

      it.each([
        ["mountOptions", 123],
        ["mountOptions", []],
        ["mountOptions", "foo"],
      ])("should throw when %s is invalid", (_name, value) => {
        const { testComponentFactory } = createTestFramework();
        const factory = testComponentFactory(component);

        expect(() => {
          factory({}, value as unknown as ComponentFactoryOptions);
        }).toThrow('"mountOptions" must be a plain object');
      });

      it.each([
        ["slots", 123],
        ["slots", []],
        ["slots", "foo"],
      ])("should throw when %s is invalid", (_name, value) => {
        const { testComponentFactory } = createTestFramework();
        const factory = testComponentFactory(component);

        expect(() => {
          factory({}, {}, value);
        }).toThrow('"slots" must be a plain object');
      });

      it.each([
        ["extraOptions", 123],
        ["extraOptions", []],
        ["extraOptions", "foo"],
      ])("should throw when %s is invalid", (_name, value) => {
        const { testComponentFactory } = createTestFramework();
        const factory = testComponentFactory(component);

        expect(() => {
          factory({}, {}, {}, value as unknown as ComponentFactoryExtraOptions);
        }).toThrow('"extraOptions" must be a plain object');
      });

      it("should not throw for valid arguments", () => {
        const { testComponentFactory } = createTestFramework();
        const factory = testComponentFactory(component);

        expect(() => {
          factory(
            {},
            {
              props: {},
              slots: {},
            },
            {},
            {},
          );
        }).not.toThrow();
      });

      describe("mountOptions plugin validation", () => {
        it("should warn when a plugin option is placed at the root of mountOptions", () => {
          const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

          const presets = {
            default: {
              manifest: [
                {
                  module: {
                    getName: () => "i18n",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          const { testComponentFactory } = createTestFramework({ presets });

          const factory = testComponentFactory(component);

          expect(() => {
            // Intentionally bypass type safety to verify runtime DX warning.
            // Plugin options must be placed under mountOptions.plugins.
            // @ts-expect-error testing invalid configuration
            factory({}, { i18n: {} });
          }).not.toThrow();

          expect(warnSpy).toHaveBeenCalledTimes(1);

          expect(warnSpy.mock.calls[0][0]).toContain(
            'Detected plugin option "i18n" at the root of "mountOptions"',
          );

          expect(warnSpy.mock.calls[0][0]).toContain(
            'Did you mean to use "mountOptions.plugins.i18n"?',
          );
        });

        it("should not warn when plugin options are placed under mountOptions.plugins", () => {
          const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

          const presets = {
            default: {
              manifest: [
                {
                  module: {
                    getName: () => "i18n",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          const { testComponentFactory } = createTestFramework({ presets });

          const factory = testComponentFactory(component);

          factory({}, {
            plugins: {
              i18n: {},
            },
          } as unknown as ComponentFactoryOptions);

          expect(warnSpy).not.toHaveBeenCalled();
        });

        it("should ignore unknown root options", () => {
          const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

          const presets = {
            default: {
              manifest: [
                {
                  module: {
                    getName: () => "i18n",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
                {
                  module: {
                    getName: () => "pinia",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          const { testComponentFactory } = createTestFramework({ presets });

          const factory = testComponentFactory(component);

          factory({}, { foo: {} } as unknown as ComponentFactoryOptions);

          expect(warnSpy).not.toHaveBeenCalled();
        });

        it("should not warn when the plugin is configured both at the root and under plugins", () => {
          const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

          const presets = {
            default: {
              manifest: [
                {
                  module: {
                    getName: () => "i18n",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          const { testComponentFactory } = createTestFramework({ presets });

          const factory = testComponentFactory(component);

          factory(
            {},
            {
              i18n: {},
              // @ts-expect-error testing invalid configuration
              plugins: {
                i18n: {},
              } as unknown as ComponentFactoryOptions,
            },
          );

          expect(warnSpy).not.toHaveBeenCalled();
        });

        describe("factory-level preset validation", () => {
          const presets = {
            default: {
              manifest: [
                {
                  module: {
                    getName: () => "i18n",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },

            admin: {
              manifest: [
                {
                  module: {
                    getName: () => "i18n",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
                {
                  module: {
                    getName: () => "pinia",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          it("should warn about misplaced plugin options using the factory preset", () => {
            const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

            try {
              const { testComponentFactory } = createTestFramework({ presets });

              const factory = testComponentFactory(component, {}, {}, {}, { presetKey: "admin" });

              factory({}, { pinia: { stubActions: true } } as unknown as ComponentFactoryOptions);

              expect(warnSpy).toHaveBeenCalledTimes(1);

              expect(warnSpy.mock.calls[0][0]).toContain(
                'Detected plugin option "pinia" at the root of "mountOptions"',
              );

              expect(warnSpy.mock.calls[0][0]).toContain(
                'Did you mean to use "mountOptions.plugins.pinia"?',
              );
            } finally {
              warnSpy.mockRestore();
            }
          });

          it("should use the mount-level preset for plugin option warnings", () => {
            const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

            try {
              const { testComponentFactory } = createTestFramework({ presets });

              const factory = testComponentFactory(component, {}, {}, {}, { presetKey: "admin" });

              factory(
                {},
                { pinia: { stubActions: true } } as unknown as ComponentFactoryOptions,
                {},
                { presetKey: "default" },
              );

              // Pinia is not declared in the mount-level preset.
              expect(warnSpy).not.toHaveBeenCalled();
            } finally {
              warnSpy.mockRestore();
            }
          });
        });
      });

      describe("extraOptions plugin validation", () => {
        it("should warn when a plugin override is placed at the root of extraOptions", () => {
          const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

          const presets = {
            default: {
              manifest: [
                {
                  module: {
                    getName: () => "i18n",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          const { testComponentFactory } = createTestFramework({ presets });

          const factory = testComponentFactory(component);

          expect(() => {
            // Intentionally bypass type safety to verify runtime DX warning.
            // Plugin overrides must be placed under extraOptions.plugins.
            // @ts-expect-error testing invalid configuration
            factory({}, {}, {}, { i18n: {} });
          }).not.toThrow();

          expect(warnSpy).toHaveBeenCalledTimes(1);

          expect(warnSpy.mock.calls[0][0]).toContain(
            'Detected plugin option "i18n" at the root of "extraOptions"',
          );

          expect(warnSpy.mock.calls[0][0]).toContain(
            'Did you mean to use "extraOptions.plugins.i18n"?',
          );
        });

        it("should not warn when plugin override is placed under extraOptions.plugins", () => {
          const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

          const presets = {
            default: {
              manifest: [
                {
                  module: {
                    getName: () => "i18n",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          const { testComponentFactory } = createTestFramework({ presets });

          const factory = testComponentFactory(component);

          factory({}, {}, {}, {
            plugins: {
              i18n: {},
            },
          } as unknown as ComponentFactoryOptions);

          expect(warnSpy).not.toHaveBeenCalled();
        });

        it("should ignore unknown root options", () => {
          const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

          const presets = {
            default: {
              manifest: [
                {
                  module: {
                    getName: () => "i18n",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
                {
                  module: {
                    getName: () => "pinia",
                    getDefinition: () => ({ create: () => {} }),
                    getDefaultOptions: () => () => ({}),
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          const { testComponentFactory } = createTestFramework({ presets });

          const factory = testComponentFactory(component);

          // @ts-expect-error testing arbitrary user input
          factory({}, {}, {}, { foo: {} });

          expect(warnSpy).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe("withOptions validation", () => {
    const component = { name: "TestComponent" };

    it("should reject an unknown preset key during factory creation", () => {
      const { testComponentFactory } = createTestFramework({
        presets: {
          default: { manifest: [], defaults: {} },
          admin: { manifest: [], defaults: {} },
        },
      });

      expect(() => {
        testComponentFactory.withOptions({
          component,
          presetKey: "unknown",
        });
      }).toThrow('Preset "unknown" is not registered.');

      expect(createPipelineContext).not.toHaveBeenCalled();
      expect(mountWithPlugins).not.toHaveBeenCalled();
    });

    it("should validate defaultProps through the existing validator", () => {
      const { testComponentFactory } = createTestFramework();

      expect(() => {
        testComponentFactory.withOptions({
          component,
          defaultProps: 123,
        } as never);
      }).toThrow('"defaultProps" must be a plain object.');
    });

    it("should validate defaultMountOptions through the existing validator", () => {
      const { testComponentFactory } = createTestFramework();

      expect(() => {
        testComponentFactory.withOptions({
          component,
          defaultMountOptions: [],
        } as never);
      }).toThrow('"defaultMountOptions" must be a plain object.');
    });

    it("should validate defaultSlots through the existing validator", () => {
      const { testComponentFactory } = createTestFramework();

      expect(() => {
        testComponentFactory.withOptions({
          component,
          defaultSlots: 123,
        } as never);
      }).toThrow('"defaultSlots" must be a plain object.');
    });
  });

  describe("withOptions", () => {
    it("should preserve all factory creation options", () => {
      const { testComponentFactory } = createTestFramework();

      const component = { name: "TestComponent" };

      const defaultProps = {
        id: 123,
        title: "Default title",
      };

      const defaultSlots = {
        default: () => "Default slot",
      };

      const defaultMountOptions = {
        shallow: true,
        props: {
          disabled: false,
        },
        slots: {
          header: () => "Header slot",
        },
        global: {
          stubs: {
            AppButton: true,
          },
        },
      };

      const factory = testComponentFactory.withOptions({
        component,
        defaultProps,
        defaultMountOptions,
        defaultSlots,
      });

      factory();

      // 1. Component is passed to the mounting function.
      expect(mountWithPlugins).toHaveBeenCalledWith(
        component,
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );

      // 2. Default props are preserved.
      expect(mergeComponentData).toHaveBeenNthCalledWith(1, {
        defaultMountData: defaultMountOptions.props,
        defaultData: defaultProps,
        mountData: undefined,
        directData: {},
        skipDefault: false,
        skipOptions: false,
      });

      // 3. Default slots are preserved.
      expect(mergeComponentData).toHaveBeenNthCalledWith(2, {
        defaultMountData: defaultMountOptions.slots,
        defaultData: defaultSlots,
        mountData: undefined,
        directData: {},
        skipDefault: false,
        skipOptions: false,
      });

      // 4. Default mount options are passed to the pipeline.
      expect(createPipelineContext).toHaveBeenCalledWith({
        defaultMountOptions,
        mountOptions: {},
        extraOptions: {},
        presets: expect.any(Object),
      });

      expect(mountWithPlugins).toHaveBeenCalledTimes(1);
    });
  });

  describe("factory.withOptions()", () => {
    it("should be available for both factory creation APIs", () => {
      const { testComponentFactory } = createTestFramework();

      const positionalFactory = testComponentFactory(component);
      const objectFactory = testComponentFactory.withOptions({ component });

      expect(positionalFactory.withOptions).toBeTypeOf("function");
      expect(objectFactory.withOptions).toBeTypeOf("function");
    });

    it("should forward named arguments to the shared mount implementation", () => {
      const { testComponentFactory } = createTestFramework();
      const factory = testComponentFactory(component);

      const props = { title: "Per-test title" };

      const mountOptions = {
        shallow: true,
        props: { count: 2 },
      };

      const slots = {};

      const extraOptions = {
        skipDefaultProps: true,
        skipDefaultSlots: true,
        skipDefaultOptions: true,
      };

      factory.withOptions({
        props,
        mountOptions,
        slots,
        extraOptions,
      });

      expect(mergeComponentData).toHaveBeenNthCalledWith(1, {
        defaultMountData: undefined,
        defaultData: {},
        mountData: mountOptions.props,
        directData: props,
        skipDefault: true,
        skipOptions: true,
      });

      expect(mergeComponentData).toHaveBeenNthCalledWith(2, {
        defaultMountData: undefined,
        defaultData: {},
        mountData: undefined,
        directData: slots,
        skipDefault: true,
        skipOptions: true,
      });

      expect(createPipelineContext).toHaveBeenCalledWith({
        defaultMountOptions: {},
        mountOptions,
        extraOptions,
        presets: expect.any(Object),
      });

      expect(mountWithPlugins).toHaveBeenCalledTimes(1);
    });

    it("should use positional defaults for omitted options", () => {
      const { testComponentFactory } = createTestFramework();
      const factory = testComponentFactory(component);

      factory.withOptions({});

      expect(mergeComponentData).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          directData: {},
          skipDefault: false,
          skipOptions: false,
        }),
      );

      expect(mergeComponentData).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          directData: {},
          skipDefault: false,
          skipOptions: false,
        }),
      );

      expect(createPipelineContext).toHaveBeenCalledWith({
        defaultMountOptions: {},
        mountOptions: {},
        extraOptions: {},
        presets: expect.any(Object),
      });

      expect(mountWithPlugins).toHaveBeenCalledTimes(1);
    });

    it("should support providing only extraOptions", () => {
      const { testComponentFactory } = createTestFramework();
      const factory = testComponentFactory(component);

      factory.withOptions({
        extraOptions: {
          skipDefaultProps: true,
          skipDefaultSlots: true,
        },
      });

      expect(mergeComponentData).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          skipDefault: true,
        }),
      );

      expect(mergeComponentData).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          skipDefault: true,
        }),
      );

      expect(createPipelineContext).toHaveBeenCalledWith(
        expect.objectContaining({
          extraOptions: {
            skipDefaultProps: true,
            skipDefaultSlots: true,
          },
        }),
      );
    });

    it("should inherit the factory-level preset", () => {
      const presets = {
        default: { manifest: [], defaults: {} },
        admin: { manifest: [], defaults: {} },
      };

      const { testComponentFactory } = createTestFramework({ presets });

      const factory = testComponentFactory.withOptions({
        component,
        presetKey: "admin",
      });

      factory.withOptions({});

      expect(createPipelineContext).toHaveBeenCalledWith(
        expect.objectContaining({
          extraOptions: {
            presetKey: "admin",
          },
        }),
      );
    });

    it("should allow mount-level preset selection to override the factory preset", () => {
      const presets = {
        default: { manifest: [], defaults: {} },
        admin: { manifest: [], defaults: {} },
      };

      const { testComponentFactory } = createTestFramework({ presets });

      const factory = testComponentFactory.withOptions({
        component,
        presetKey: "admin",
      });

      factory.withOptions({
        extraOptions: {
          presetKey: "default",
        },
      });

      expect(createPipelineContext).toHaveBeenCalledWith(
        expect.objectContaining({
          extraOptions: {
            presetKey: "default",
          },
        }),
      );
    });

    it("should return the mount result", () => {
      const { testComponentFactory } = createTestFramework();
      const factory = testComponentFactory(component);

      const result = factory.withOptions({});

      expect(result).toBe("wrapper");
      expect(mountWithPlugins).toHaveBeenCalledTimes(1);
    });

    it("should reject unknown invocation options before running the pipeline", () => {
      const { testComponentFactory } = createTestFramework();
      const factory = testComponentFactory(component);

      expect(() => {
        factory.withOptions({
          extraOption: {},
        } as never);
      }).toThrow('Unknown option "extraOption" in "options".');

      expect(createPipelineContext).not.toHaveBeenCalled();
      expect(mountWithPlugins).not.toHaveBeenCalled();
    });

    it("should reject non-object invocation options", () => {
      const { testComponentFactory } = createTestFramework();
      const factory = testComponentFactory(component);

      expect(() => {
        factory.withOptions(null as never);
      }).toThrow('"options" must be a plain object.');

      expect(createPipelineContext).not.toHaveBeenCalled();
      expect(mountWithPlugins).not.toHaveBeenCalled();
    });

    it("should validate nested arguments through the shared positional validators", () => {
      const { testComponentFactory } = createTestFramework();
      const factory = testComponentFactory(component);

      expect(() => {
        factory.withOptions({
          props: 123,
        } as never);
      }).toThrow('"props" must be a plain object');

      expect(createPipelineContext).not.toHaveBeenCalled();
      expect(mountWithPlugins).not.toHaveBeenCalled();
    });
  });
});
