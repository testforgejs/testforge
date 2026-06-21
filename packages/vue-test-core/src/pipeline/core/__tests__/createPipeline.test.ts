import { describe, it, expect, vi, beforeEach } from "vitest";

import type { PipelineContext } from "../../../types";

// mock BEFORE import
vi.mock("../runPipeline.js", () => ({
  runPipeline: vi.fn(),
}));

import { runPipeline } from "../runPipeline.js";
import { createPipeline } from "../createPipeline.js";

const mockRunPipeline = vi.mocked(runPipeline);

describe("createPipeline", () => {
  const ctx: PipelineContext = {
    defaultMountOptions: {},
    mountOptions: {},
    extraOptions: {},
    supportedPlugins: {},
    preset: undefined,
    result: {
      mountOptions: {},
      global: {},
      pluginDefaultsState: {},
      plugins: {},
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return pipeline object with run method", () => {
    const pipeline = createPipeline([]);

    expect(typeof pipeline).toBe("object");
    expect(typeof pipeline.run).toBe("function");
  });

  it("should call runPipeline with provided middlewares and ctx", () => {
    const m1 = (ctx: PipelineContext) => ctx;
    const m2 = (ctx: PipelineContext) => ctx;

    const middlewares = [m1, m2];

    mockRunPipeline.mockReturnValue(ctx);

    const pipeline = createPipeline(middlewares);
    pipeline.run(ctx);

    expect(mockRunPipeline).toHaveBeenCalledTimes(1);
    expect(mockRunPipeline).toHaveBeenCalledWith(ctx, middlewares);
  });

  it("should return result from runPipeline", () => {
    const resultCtx = {
      defaultMountOptions: {},
      mountOptions: {},
      extraOptions: {},
      supportedPlugins: {},
      preset: undefined,
      result: {
        mountOptions: {},
        global: {},
        pluginDefaultsState: {},
        plugins: {},
      },
    };
    mockRunPipeline.mockReturnValue(resultCtx);

    const pipeline = createPipeline([]);
    const result = pipeline.run(ctx);

    expect(result).toBe(resultCtx);
  });
});
