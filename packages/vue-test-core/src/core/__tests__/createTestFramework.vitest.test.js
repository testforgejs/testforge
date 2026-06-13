import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestFramework } from "../createTestFramework.js";

import { mergeComponentData } from "../../utils/mergeComponentData.js";
import { createPipelineContext } from "../../pipeline/core/createPipelineContext.js";
import { createPipeline } from "../../pipeline/core/createPipeline.js";
import { createMountPipeline } from "../../pipeline/mount/createMountPipeline.js";
import { mountWithPlugins } from "../mountWithPlugins.js";

vi.mock("../../utils/mergeComponentData.js", () => ({
  mergeComponentData: vi.fn((x) => x),
}));

vi.mock("../../pipeline/core/createPipelineContext.js", () => ({
  createPipelineContext: vi.fn(() => ({ ctx: true })),
}));

vi.mock("../../pipeline/core/createPipeline.js", () => ({
  createPipeline: vi.fn(() => ({
    run: vi.fn(),
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
      mergeComponentData
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

      factory({}, {}, {}, { preset: "abcd" });

      expect(createPipelineContext).toHaveBeenCalledWith({
        defaultMountOptions: {},
        mountOptions: {},
        extraOptions: { preset: "abcd" },
        presets,
      });
    });
  });

  describe("pipeline execution", () => {
    it("should run pipeline before mounting", () => {
      const { testComponentFactory } = createTestFramework();

      const factory = testComponentFactory(component);

      factory();

      const pipeline = createPipeline.mock.results[0].value;

      expect(createMountPipeline).toHaveBeenCalledWith({ ctx: true });
      expect(pipeline.run).toHaveBeenCalledWith({ ctx: true });
    });
  });

  describe("mounting phase", () => {
    it("should call mountWithPlugins with merged data and runtime options", () => {
      mergeComponentData
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
      test("should throw an error when shallowByDefault is not a boolean", () => {
        expect(() =>
          createTestFramework({
            shallowByDefault: "true",
          }),
        ).toThrow('"shallowByDefault" must be a boolean');
      });

      test("should throw an error when options is not a plain object", () => {
        expect(() => createTestFramework(123)).toThrow(
          "createTestFramework options must be a plain object.",
        );
      });
    });

    describe("testComponentFactory validation", () => {
      it("should throw when component is not an object", () => {
        const { testComponentFactory } = createTestFramework();

        expect(() => {
          testComponentFactory(null);
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
          testComponentFactory(component, {}, value);
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
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          const { testComponentFactory } = createTestFramework({ presets });

          testComponentFactory(
            component,
            {},
            {
              plugins: {
                i18n: {},
              },
            },
          );

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
                  },
                  enabled: true,
                },
                {
                  module: {
                    getName: () => "pinia",
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          const { testComponentFactory } = createTestFramework({ presets });

          // @ts-expect-error testing arbitrary user input
          testComponentFactory(component, {}, { foo: {} });

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
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          const { testComponentFactory } = createTestFramework({ presets });

          // @ts-expect-error testing invalid configuration
          testComponentFactory(
            component,
            {},
            {
              i18n: {},
              plugins: {
                i18n: {},
              },
            },
          );

          expect(warnSpy).not.toHaveBeenCalled();
        });

        it("should always use the default preset for defaultMountOptions validation", () => {
          const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

          const presets = {
            default: {
              manifest: [
                {
                  module: {
                    getName: () => "i18n",
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
                  },
                  enabled: true,
                },
              ],
              defaults: {},
            },
          };

          const { testComponentFactory } = createTestFramework({ presets });

          expect(() => {
            // @ts-expect-error testing invalid configuration
            testComponentFactory(component, {}, { i18n: {} });
          }).not.toThrow();

          expect(warnSpy).toHaveBeenCalledTimes(1);

          expect(warnSpy.mock.calls[0][0]).toContain('"defaultMountOptions"');
        });
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
          factory({}, value);
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
          factory({}, {}, {}, value);
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
              plugins: {
                i18n: {},
              },
            },
          );

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
                  },
                  enabled: true,
                },
                {
                  module: {
                    getName: () => "pinia",
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
          factory({}, { foo: {} });

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
              // @ts-expect-error testing invalid configuration
              i18n: {},
              plugins: {
                i18n: {},
              },
            },
          );

          expect(warnSpy).not.toHaveBeenCalled();
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
            {},
            {},
            {
              plugins: {
                i18n: {},
              },
            },
          );

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
                  },
                  enabled: true,
                },
                {
                  module: {
                    getName: () => "pinia",
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
});
