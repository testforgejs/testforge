/**
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
 * @param {MountContext} ctx - Current pipeline context
 * @param {Partial<MountContextResult>} patch - Partial result to merge
 *
 * @returns {MountContext} Updated context (same reference)
 *
 * @example
 * mergeResult(ctx, {
 *   plugins: { i18n: { locale: 'en' } }
 * })
 */
export function patchResultState(ctx, patch) {
  ctx.result.mountOptions = {
    ...ctx.result.mountOptions,
    ...(patch.mountOptions || {}),
  };

  ctx.result.plugins = {
    ...ctx.result.plugins,
    ...(patch.plugins || {}),
  };

  ctx.result.pluginPresets = {
    ...ctx.result.pluginPresets,
    ...(patch.pluginPresets || {}),
  };

  ctx.result.global = {
    ...ctx.result.global,
    ...(patch.global || {}),
  };

  return ctx;
}
