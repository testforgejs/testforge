import type { PipelineContext, PipelineResultPatch } from "../../types";

import { mergeRecord } from "./mergeRecord.js";

/*
 * Safely merges partial result data into the pipeline context.
 *
 * Ensures that the `ctx.result` structure is preserved while
 * updating only the provided fields (`mountOptions`, `plugins`, `pluginDefaultsState`, `global`).
 *
 * This helper prevents accidental overwrites and guarantees
 * that all result sections remain initialized.
 *
 * Designed for use inside pipeline middleware.
 *
 * @example
 * mergeResult(ctx, {
 *   plugins: { i18n: { locale: 'en' } }
 * })
 */
export function patchResultState<T extends PipelineContext>(ctx: T, patch: PipelineResultPatch): T {
  if (patch.mountOptions) {
    ctx.result.mountOptions = mergeRecord(ctx.result.mountOptions, patch.mountOptions);
  }

  if (patch.plugins) {
    ctx.result.plugins = mergeRecord(ctx.result.plugins, patch.plugins);
  }

  if (patch.pluginDefaultsState) {
    ctx.result.pluginDefaultsState = mergeRecord(
      ctx.result.pluginDefaultsState,
      patch.pluginDefaultsState,
    );
  }

  if (patch.global) {
    ctx.result.global = mergeRecord(ctx.result.global, patch.global);
  }

  return ctx;
}
