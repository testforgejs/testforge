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
 * Configuration options for the PrimeVue test plugin.
 *
 * Maps directly to the native PrimeVue configuration.
 *
 * PrimeVue uses an install-based Vue plugin integration rather than
 * a managed runtime instance. Therefore, TestForge instance management
 * mechanisms are not supported:
 *
 * - `captureInstance()`
 * - `withPluginInstance()`
 * - `fromPluginInstance()`
 *
 * @example
 * Configure PrimeVue for a component test:
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
