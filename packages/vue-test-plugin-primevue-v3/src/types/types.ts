import type PrimeVue from "primevue/config";
import type { PrimeVueConfiguration } from "primevue/config";

/**
 * Vue Test Utils-compatible plugin tuple for PrimeVue 3.
 *
 * Represents the install-based PrimeVue 3 plugin together with its configuration,
 * as accepted by Vue Test Utils through `global.plugins`.
 *
 * @see `PrimeVueConfiguration` from `primevue/config`.
 */
export type PrimeVueMountPlugin = [typeof PrimeVue, PrimeVueConfiguration];

/**
 * Configuration options for the managed PrimeVue 3 plugin.
 *
 * Maps directly to the standard PrimeVue 3 configuration.
 *
 * Unlike plugins that create a dedicated runtime instance, PrimeVue 3 uses
 * an install-based Vue plugin integration and therefore does not support
 * TestForge instance controls such as `expose`.
 *
 * @example
 * Configure the managed PrimeVue 3 plugin for a component test:
 *
 * ```ts
 * factory({}, {
 *   plugins: {
 *     primevueV3: {
 *       ripple: true,
 *     },
 *   },
 * });
 * ```
 *
 * @see `PrimeVueConfiguration` from `primevue/config`.
 */
export type VueTestPrimeVueOptions = PrimeVueConfiguration;
