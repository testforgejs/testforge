import { describe, it, expectTypeOf } from "vitest";
import type {
  PipelineContext,
  PipelineMiddleware,
  RuntimeContext,
  MountReadyContext,
} from "../../types";

import { assertConfigurationShape } from "../middleware/validation/assertConfigurationShape.js";
import {
  assertResultShape,
  assertFinalResultShape,
} from "../middleware/validation/assertResultShape.js";
import { withPreset } from "../middleware/transformers/withPreset.js";
import { withPluginsManifest } from "../middleware/transformers/withPluginsManifest.js";
import { withBaseMountOptions } from "../middleware/transformers/withBaseMountOptions.js";
import { withGlobal } from "../middleware/transformers/withGlobal.js";
import { withAttrs } from "../middleware/transformers/withAttrs.js";
import { withPluginsBase } from "../middleware/transformers/withPluginsBase.js";
import { assertPluginOptions } from "../middleware/validation/assertPluginOptions.js";
import { createPluginsMiddlewares } from "../plugins/builders/createPluginsMiddlewares.js";
import { createPluginMiddleware } from "../plugins/adapters/createPluginMiddleware.js";
import { createPluginsMergeMiddlewares } from "../plugins/builders/createPluginsMergeMiddlewares.js";
import { createPluginMergeMiddleware } from "../plugins/adapters/createPluginMergeMiddleware.js";

describe("Pipeline Type Transformation Flow", () => {
  it("should correctly track and transform types step-by-step through middleware execution", () => {
    // STEP 0: Pipeline entry point
    type Stage0_Context = PipelineContext;

    // STEP 1: assertConfigurationShape (Input: PipelineContext -> Output: RuntimeContext)
    type Stage1_OutputContext = typeof assertConfigurationShape extends (
      ctx: Stage0_Context,
    ) => infer Out
      ? Out
      : never;
    expectTypeOf<Stage1_OutputContext>().toEqualTypeOf<RuntimeContext>();

    // STEP 2: assertResultShape (Input: RuntimeContext -> Output: RuntimeContext)
    type Stage2_OutputContext = typeof assertResultShape extends (
      ctx: Stage1_OutputContext,
    ) => infer Out
      ? Out
      : never;
    expectTypeOf<Stage2_OutputContext>().toEqualTypeOf<RuntimeContext>();

    // STEP 3: withPreset (Input: RuntimeContext -> Output: RuntimeContext)
    type Stage3_OutputContext = typeof withPreset extends (ctx: Stage2_OutputContext) => infer Out
      ? Out
      : never;
    expectTypeOf<Stage3_OutputContext>().toEqualTypeOf<RuntimeContext>();

    // STEP 4: withPluginsManifest (Input: RuntimeContext -> Output: RuntimeContext)
    type Stage4_OutputContext = typeof withPluginsManifest extends (
      ctx: Stage3_OutputContext,
    ) => infer Out
      ? Out
      : never;
    expectTypeOf<Stage4_OutputContext>().toEqualTypeOf<RuntimeContext>();

    // STEP 5: withBaseMountOptions (Input: RuntimeContext -> Output: RuntimeContext)
    type Stage5_OutputContext = typeof withBaseMountOptions extends (
      ctx: Stage4_OutputContext,
    ) => infer Out
      ? Out
      : never;
    expectTypeOf<Stage5_OutputContext>().toEqualTypeOf<RuntimeContext>();

    // STEP 6: withGlobal (Input: RuntimeContext -> Output: RuntimeContext)
    type Stage6_OutputContext = typeof withGlobal extends (ctx: Stage5_OutputContext) => infer Out
      ? Out
      : never;
    expectTypeOf<Stage6_OutputContext>().toEqualTypeOf<RuntimeContext>();

    // STEP 7: withAttrs (Input: RuntimeContext -> Output: RuntimeContext)
    type Stage7_OutputContext = typeof withAttrs extends (ctx: Stage6_OutputContext) => infer Out
      ? Out
      : never;
    expectTypeOf<Stage7_OutputContext>().toEqualTypeOf<RuntimeContext>();

    // STEP 8: withPluginsBase (Input: RuntimeContext -> Output: RuntimeContext)
    type Stage8_OutputContext = typeof withPluginsBase extends (
      ctx: Stage7_OutputContext,
    ) => infer Out
      ? Out
      : never;
    expectTypeOf<Stage8_OutputContext>().toEqualTypeOf<RuntimeContext>();

    // ------------------------------------------------------------------------
    // STEP 9: Validating plugin options (assertPluginOptions)
    // Input: RuntimeContext (result of Step 8) -> Output: RuntimeContext
    // ------------------------------------------------------------------------
    type Stage9_OutputContext = typeof assertPluginOptions extends (
      ctx: Stage8_OutputContext,
    ) => infer Out
      ? Out
      : never;

    // Checking the final narrowing of the static section of the pipeline
    expectTypeOf<Stage9_OutputContext>().toEqualTypeOf<RuntimeContext>();

    // Check that MountReadyContext inherits from the base PipelineContext
    expectTypeOf<MountReadyContext>().toExtend<PipelineContext>();

    // ------------------------------------------------------------------------
    // DYNAMIC STEP 10: Testing the plugin adapter (createPluginMiddleware)
    // Input: RuntimeContext (result of Step 9) -> Output: RuntimeContext
    // ------------------------------------------------------------------------

    // 1. Create a middleware instance for a specific plugin
    const mockRouterMiddleware = createPluginMiddleware("router");
    type RouterMiddlewareType = typeof mockRouterMiddleware;

    // 2. Check how this middleware handles the context of Step 9
    type Stage10_OutputContext = RouterMiddlewareType extends (
      ctx: Stage9_OutputContext,
    ) => infer Out
      ? Out
      : never;

    expectTypeOf<Stage10_OutputContext>().toEqualTypeOf<RuntimeContext>();

    // ------------------------------------------------------------------------
    // BUILDER CHECK: Testing the array contract (createPluginsMiddlewares)
    // ------------------------------------------------------------------------
    type BuilderResult = ReturnType<typeof createPluginsMiddlewares>;

    // Verify that the builder returns strictly an array of middleware compatible with MountReadyContext
    expectTypeOf<BuilderResult>().toEqualTypeOf<
      PipelineMiddleware<RuntimeContext, RuntimeContext>[]
    >();

    // ------------------------------------------------------------------------
    // DYNAMIC STEP 11: Testing the preset merge adapter (createPluginMergeMiddleware)
    // Input: RuntimeContext (result of Step 10) -> Output: RuntimeContext
    // ------------------------------------------------------------------------
    const mockMergeMiddleware = createPluginMergeMiddleware("router");

    type Stage11_OutputContext = typeof mockMergeMiddleware extends (
      ctx: Stage10_OutputContext,
    ) => infer Out
      ? Out
      : never;

    expectTypeOf<Stage11_OutputContext>().toEqualTypeOf<RuntimeContext>();

    // ------------------------------------------------------------------------
    // CHECKING THE MERGE BUILDER: Testing the array contract (createPluginsMergeMiddlewares)
    // ------------------------------------------------------------------------
    type MergeBuilderResult = ReturnType<typeof createPluginsMergeMiddlewares>;

    expectTypeOf<MergeBuilderResult>().toEqualTypeOf<
      PipelineMiddleware<RuntimeContext, RuntimeContext>[]
    >();

    // ------------------------------------------------------------------------
    // FINAL STEP 12: Revalidate the result (assertResultShape)
    // Input: RuntimeContext -> Output: MountReadyContext
    // ------------------------------------------------------------------------

    type Stage12_OutputContext = typeof assertFinalResultShape extends (
      ctx: Stage11_OutputContext,
    ) => infer Out
      ? Out
      : never;

    expectTypeOf<Stage12_OutputContext>().toEqualTypeOf<MountReadyContext>();
  });

  it("should correctly infer pipe result type using PipeResult helper for entire static pipeline sequence", () => {
    // Pass the entire static chain to the PipeResult type helper
    type MiddlewareChain = readonly [
      typeof assertConfigurationShape,
      typeof assertResultShape,
      typeof withPreset,
      typeof withPluginsManifest,
      typeof withBaseMountOptions,
      typeof withGlobal,
      typeof withAttrs,
      typeof withPluginsBase,
      typeof assertPluginOptions,
    ];

    type InferredContext = import("../../types").PipeResult<PipelineContext, MiddlewareChain>;

    expectTypeOf<InferredContext>().toEqualTypeOf<RuntimeContext>();
  });
});
