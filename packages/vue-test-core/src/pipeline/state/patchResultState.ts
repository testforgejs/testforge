import type { MountContext, MountResultPatch } from "../../types";

import { mergeRecord } from "./mergeRecord.js";

/*
 * Safely merges partial result data into the pipeline context.
 *
 * Ensures that the `ctx.result` structure is preserved while
 * updating only the provided fields (`mountOptions`, `plugins`, `pluginPresets`, `global`).
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
export function patchResultState<T extends MountContext>(ctx: T, patch: MountResultPatch): T {
  if (patch.mountOptions) {
    ctx.result.mountOptions = mergeRecord(ctx.result.mountOptions, patch.mountOptions);
  }

  if (patch.plugins) {
    ctx.result.plugins = mergeRecord(ctx.result.plugins, patch.plugins);
  }

  if (patch.pluginPresets) {
    ctx.result.pluginPresets = mergeRecord(ctx.result.pluginPresets, patch.pluginPresets);
  }

  if (patch.global) {
    ctx.result.global = mergeRecord(ctx.result.global, patch.global);
  }

  return ctx;
}
