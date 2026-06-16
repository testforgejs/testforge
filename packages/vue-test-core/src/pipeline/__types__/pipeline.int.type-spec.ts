import { describe, it, expectTypeOf } from "vitest";
import type { PipelineContext, PluginOptionsReadyContext } from "../../types";

import { createPipelineContext } from "../core/createPipelineContext";
import { createMountPipeline } from "../mount/createMountPipeline";
import { createPipeline } from "../core/createPipeline";

describe("Pipeline Real Runtime Type Flow", () => {
  it("should infer PluginOptionsReadyContext as the exact output type when the pipeline is executed", () => {
    // 1. Simulate the creation of a context in the factory (Input: parameters -> Output: PipelineContext)
    const mockParams = {
      defaultMountOptions: {},
      mountOptions: {},
      extraOptions: {},
      presets: {},
    };

    const ctx = createPipelineContext(mockParams);

    expectTypeOf<typeof ctx>().toEqualTypeOf<PipelineContext>();

    // 2. Imitating the creation of a middleware chain (Input: PipelineContext -> Output: array of middleware)
    const middlewares = createMountPipeline(ctx);

    // 3. Simulating a pipeline assembly (createPipeline)
    const pipeline = createPipeline(middlewares);

    // 4. Simulate a real run (pipeline.run(ctx))
    const pipelineResult = pipeline.run(ctx);

    // Check the return type of the .run() method on the pipeline instance
    expectTypeOf<typeof pipelineResult>().toEqualTypeOf<PluginOptionsReadyContext>();
  });
});
