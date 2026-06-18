import { describe, it, expectTypeOf } from "vitest";

import type { PipelineContext, PipelineMiddleware } from "../../../types";

import { createPipeline } from "../createPipeline.js";

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

  describe("TypeState Compilation Flow", () => {
    // Creating Dummy Brands to Isolate Test Types
    interface Step1Context extends PipelineContext {
      _step1: true;
    }
    interface Step2Context extends Step1Context {
      _step2: true;
    }

    it("should correctly infer and forward type transmutation through the pipeline", () => {
      // Imitating a TypeState transformation chain
      const m1: PipelineMiddleware<PipelineContext, Step1Context> = (ctx) => ctx as Step1Context;
      const m2: PipelineMiddleware<Step1Context, Step2Context> = (ctx) => ctx as Step2Context;

      // The array must be declared as `const` to preserve the types of its elements
      const middlewares = [m1, m2] as const;
      const pipeline = createPipeline(middlewares);

      // Verify that the return type of the `run()` method is automatically inferred as a final `Step2Context`
      expectTypeOf(pipeline.run).returns.toEqualTypeOf<Step2Context>();
    });

    it("should fallback to input context type when middleware array is empty", () => {
      const pipeline = createPipeline([] as const);

      // If the pipeline is empty, the output type must be the same as the input type
      expectTypeOf(pipeline.run(ctx)).toEqualTypeOf<typeof ctx>();
    });
  });
});
