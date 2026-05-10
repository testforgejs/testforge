import { describe, it, expect, vi, beforeEach } from "vitest";

// mock BEFORE import
vi.mock("../runPipeline.js", () => ({
  runPipeline: vi.fn(),
}));

import { runPipeline } from "../runPipeline.js";
import { createPipeline } from "../createPipeline.js";

describe("createPipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return pipeline object with run method", () => {
    const pipeline = createPipeline([]);

    expect(typeof pipeline).toBe("object");
    expect(typeof pipeline.run).toBe("function");
  });

  it("should call runPipeline with provided middlewares and ctx", () => {
    const middlewares = ["m1", "m2"];
    const ctx = { a: 1 };

    runPipeline.mockReturnValue(ctx);

    const pipeline = createPipeline(middlewares);
    pipeline.run(ctx);

    expect(runPipeline).toHaveBeenCalledTimes(1);
    expect(runPipeline).toHaveBeenCalledWith(ctx, middlewares);
  });

  it("should return result from runPipeline", () => {
    const resultCtx = { done: true };
    runPipeline.mockReturnValue(resultCtx);

    const pipeline = createPipeline([]);
    const result = pipeline.run({});

    expect(result).toBe(resultCtx);
  });
});
