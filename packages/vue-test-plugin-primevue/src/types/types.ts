import type PrimeVue from "primevue/config";
import type { PrimeVueConfiguration } from "primevue/config";

/**
 * Vue Test Utils-compatible plugin tuple for PrimeVue.
 *
 * Represents the install-based PrimeVue plugin together with its configuration,
 * as accepted by Vue Test Utils through `global.plugins`.
 *
 * @see `PrimeVueConfiguration` from `primevue/config`.
 */
export type PrimeVueMountPlugin = [typeof PrimeVue, PrimeVueConfiguration];

/**
 * Configuration options for the managed PrimeVue plugin.
 *
 * Maps directly to the standard PrimeVue configuration.
 *
 * Unlike plugins that create a dedicated runtime instance, PrimeVue uses
 * an install-based Vue plugin integration and therefore does not support
 * TestForge instance controls such as `expose`.
 *
 * @example
 * Configure the managed PrimeVue plugin for a component test:
 *
 * ```ts
 * factory({}, {
 *   plugins: {
 *     primevue: {
 *       ripple: true,
 *     },
 *   },
 * });
 * ```
 *
 * @see `PrimeVueConfiguration` from `primevue/config`.
 */
export type VueTestPrimeVueOptions = PrimeVueConfiguration;
