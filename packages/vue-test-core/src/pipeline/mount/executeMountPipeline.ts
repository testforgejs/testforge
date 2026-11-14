import type { CreatePipelineContextParams, MountReadyContext } from "../../types.js";

import { createPipelineContext } from "../core/createPipelineContext.js";
import { createPipeline } from "../core/createPipeline.js";
import { createMountPipeline } from "./createMountPipeline.js";

/*
 * Initializes and executes the mount pipeline, returning the context
 * prepared for plugin-aware component mounting.
 */
export function executeMountPipeline(params: CreatePipelineContextParams): MountReadyContext {
  const ctx = createPipelineContext(params);
  const pipeline = createPipeline(createMountPipeline(ctx));

  return pipeline.run(ctx);
}
