import type { ComponentFactoryExtraOptions, RuntimeExtraOptions } from "../../../types";

/*
 * Converts public extraOptions input into runtime-ready overlay state.
 *
 * Why this exists:
 * - `ComponentFactoryExtraOptions` contains strict public API types
 *   exposed through module augmentation.
 * - Pipeline runtime works with normalized plugin overlays
 *   (`ResolvedPluginOptions`) that may include internal metadata.
 *
 * This function represents the transition point between:
 *   public API input -> internal runtime pipeline state
 *
 * No runtime transformation is currently required.
 * The conversion is intentionally implemented as a typed boundary
 * to make pipeline phases explicit and future-proof.
 */
export function resolveExtraOptions(
  extraOptions: ComponentFactoryExtraOptions,
): RuntimeExtraOptions {
  return extraOptions as RuntimeExtraOptions;
}
