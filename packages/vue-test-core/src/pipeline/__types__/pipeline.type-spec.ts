import { describe, it, expectTypeOf } from "vitest";
import type {
  PipelineContext,
  PipelineMiddleware,
  ResultReadyContext,
  PluginOptionsReadyContext,
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

    // STEP 1: assertConfigurationShape (Input: PipelineContext -> Output: PipelineContext)
    type Stage1_OutputContext = typeof assertConfigurationShape extends (
      ctx: Stage0_Context,
    ) => infer Out
      ? Out
      : never;
    expectTypeOf<Stage1_OutputContext>().toEqualTypeOf<PipelineContext>();

    // STEP 2: assertResultShape (Input: PipelineContext -> Output: ResultReadyContext)
    type Stage2_OutputContext = typeof assertResultShape extends (
      ctx: Stage1_OutputContext,
    ) => infer Out
      ? Out
      : never;
    expectTypeOf<Stage2_OutputContext>().toEqualTypeOf<ResultReadyContext>();

    // STEP 3: withPreset (Input: ResultReadyContext -> Output: ResultReadyContext)
    type Stage3_OutputContext = typeof withPreset extends (ctx: Stage2_OutputContext) => infer Out
      ? Out
      : never;

    // STEP 4: withPluginsManifest (Input: ResultReadyContext -> Output: ResultReadyContext)
    type Stage4_OutputContext = typeof withPluginsManifest extends (
      ctx: Stage3_OutputContext,
    ) => infer Out
      ? Out
      : never;

    // STEP 5: withBaseMountOptions (Input: ResultReadyContext -> Output: ResultReadyContext)
    type Stage5_OutputContext = typeof withBaseMountOptions extends (
      ctx: Stage4_OutputContext,
    ) => infer Out
      ? Out
      : never;

    // STEP 6: withGlobal (Input: ResultReadyContext -> Output: ResultReadyContext)
    type Stage6_OutputContext = typeof withGlobal extends (ctx: Stage5_OutputContext) => infer Out
      ? Out
      : never;

    // STEP 7: withAttrs (Input: ResultReadyContext -> Output: ResultReadyContext)
    type Stage7_OutputContext = typeof withAttrs extends (ctx: Stage6_OutputContext) => infer Out
      ? Out
      : never;

    // STEP 8: withPluginsBase (Input: ResultReadyContext -> Output: ResultReadyContext)
    type Stage8_OutputContext = typeof withPluginsBase extends (
      ctx: Stage7_OutputContext,
    ) => infer Out
      ? Out
      : never;
    expectTypeOf<Stage8_OutputContext>().toEqualTypeOf<ResultReadyContext>();

    // ------------------------------------------------------------------------
    // STEP 9: Validating and narrowing down plugin options (assertPluginOptions)
    // Input: ResultReadyContext (result of Step 8) -> Output: PluginOptionsReadyContext
    // ------------------------------------------------------------------------
    type Stage9_OutputContext = typeof assertPluginOptions extends (
      ctx: Stage8_OutputContext,
    ) => infer Out
      ? Out
      : never;

    // Checking the final narrowing of the static section of the pipeline
    expectTypeOf<Stage9_OutputContext>().toEqualTypeOf<PluginOptionsReadyContext>();

    // Check that PluginOptionsReadyContext inherits from the base PipelineContext
    expectTypeOf<PluginOptionsReadyContext>().toExtend<PipelineContext>();

    // ------------------------------------------------------------------------
    // DYNAMIC STEP 10: Testing the plugin adapter (createPluginMiddleware)
    // Input: PluginOptionsReadyContext (result of Step 9) -> Output: PluginOptionsReadyContext
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

    expectTypeOf<Stage10_OutputContext>().toEqualTypeOf<PluginOptionsReadyContext>();

    // ------------------------------------------------------------------------
    // BUILDER CHECK: Testing the array contract (createPluginsMiddlewares)
    // ------------------------------------------------------------------------
    type BuilderResult = ReturnType<typeof createPluginsMiddlewares>;

    // Verify that the builder returns strictly an array of middleware compatible with PluginOptionsReadyContext
    expectTypeOf<BuilderResult>().toEqualTypeOf<
      PipelineMiddleware<PluginOptionsReadyContext, PluginOptionsReadyContext>[]
    >();

    // ------------------------------------------------------------------------
    // DYNAMIC STEP 11: Testing the preset merge adapter (createPluginMergeMiddleware)
    // Input: PluginOptionsReadyContext (result of Step 10) -> Output: PluginOptionsReadyContext
    // ------------------------------------------------------------------------
    const mockMergeMiddleware = createPluginMergeMiddleware("router");

    type Stage11_OutputContext = typeof mockMergeMiddleware extends (
      ctx: Stage10_OutputContext,
    ) => infer Out
      ? Out
      : never;

    expectTypeOf<Stage11_OutputContext>().toEqualTypeOf<PluginOptionsReadyContext>();

    // ------------------------------------------------------------------------
    // CHECKING THE MERGE BUILDER: Testing the array contract (createPluginsMergeMiddlewares)
    // ------------------------------------------------------------------------
    type MergeBuilderResult = ReturnType<typeof createPluginsMergeMiddlewares>;

    expectTypeOf<MergeBuilderResult>().toEqualTypeOf<
      PipelineMiddleware<PluginOptionsReadyContext, PluginOptionsReadyContext>[]
    >();

    // ------------------------------------------------------------------------
    // FINAL STEP 12: Revalidate the result (assertResultShape)
    // Input: PluginOptionsReadyContext -> Output: PluginOptionsReadyContext
    // ------------------------------------------------------------------------

    type Stage12_OutputContext = typeof assertFinalResultShape extends (
      ctx: Stage11_OutputContext,
    ) => infer Out
      ? Out
      : never;

    expectTypeOf<Stage12_OutputContext>().toEqualTypeOf<PluginOptionsReadyContext>();
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

    expectTypeOf<InferredContext>().toEqualTypeOf<PluginOptionsReadyContext>();
  });
});
