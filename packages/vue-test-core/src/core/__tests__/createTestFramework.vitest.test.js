import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestFramework } from "../createTestFramework.js";

import { mergeComponentData } from "../../utils/mergeComponentData.js";
import { createMountContext } from "../../pipeline/createMountContext.js";
import { createPipeline } from "../../pipeline/createPipeline.js";
import { createMountPipeline } from "../../pipeline/createMountPipeline.js";
import { mountWithPlugins } from "../mountWithPlugins.js";

vi.mock("../../utils/mergeComponentData.js", () => ({
  mergeComponentData: vi.fn((x) => x),
}));

vi.mock("../../pipeline/createMountContext.js", () => ({
  createMountContext: vi.fn(() => ({ ctx: true })),
}));

vi.mock("../../pipeline/createPipeline.js", () => ({
  createPipeline: vi.fn(() => ({
    run: vi.fn(),
  })),
}));

vi.mock("../../pipeline/createMountPipeline.js", () => ({
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
      const presets = { test: true };
      const { testComponentFactory } = createTestFramework({ presets });

      const factory = testComponentFactory(component);

      factory({}, {}, {}, { extra: true });

      expect(createMountContext).toHaveBeenCalledWith({
        defaultMountOptions: {},
        mountOptions: {},
        extraOptions: { extra: true },
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
    it("should call mountWithPlugins with merged data", () => {
      mergeComponentData
        .mockReturnValueOnce({ finalProps: 123 })
        .mockReturnValueOnce({ finalSlots: 456 });

      const { testComponentFactory } = createTestFramework();
      const factory = testComponentFactory({}, {}, {}, {});

      factory({}, {}, {});

      expect(mountWithPlugins).toHaveBeenCalledWith({}, expect.any(Object), {
        props: { finalProps: 123 },
        slots: { finalSlots: 456 },
      });
    });

    it("should return mount result", () => {
      const { testComponentFactory } = createTestFramework();

      const factory = testComponentFactory(component);

      const result = factory();

      expect(result).toBe("wrapper");
    });
  });
});
