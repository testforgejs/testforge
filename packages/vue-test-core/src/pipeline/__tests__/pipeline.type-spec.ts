import { describe, it, expectTypeOf } from "vitest";
import type { PipelineContext, ResultReadyContext, PluginOptionsReadyContext } from "../../types";

import { assertConfigurationShape } from "../middleware/validation/assertConfigurationShape";
import { assertResultShape } from "../middleware/validation/assertResultShape";
import { withPreset } from "../middleware/transformers/withPreset";
import { withPluginsManifest } from "../middleware/transformers/withPluginsManifest";
import { withBaseMountOptions } from "../middleware/transformers/withBaseMountOptions";
import { withGlobal } from "../middleware/transformers/withGlobal";
import { withAttrs } from "../middleware/transformers/withAttrs";
import { withPluginsBase } from "../middleware/transformers/withPluginsBase";
import { assertPluginOptions } from "../middleware/validation/assertPluginOptions";

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
