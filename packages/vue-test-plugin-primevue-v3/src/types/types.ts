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
 * Configuration options for the PrimeVue 3 test plugin.
 *
 * Maps directly to the native PrimeVue 3 configuration.
 *
 * PrimeVue 3 uses an install-based Vue plugin integration rather than
 * a managed runtime instance. Therefore, TestForge instance management
 * mechanisms are not supported:
 *
 * - `captureInstance()`
 * - `withPluginInstance()`
 * - `fromPluginInstance()`
 *
 * @example
 * Configure PrimeVue 3 for a component test:
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
