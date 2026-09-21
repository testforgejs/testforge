import PrimeVue from "primevue/config";

import type { PrimeVueConfiguration } from "primevue/config";

/**
 * Vue Test Utils compatible plugin tuple for PrimeVue 3.
 *
 * PrimeVue 3 is an install-based Vue plugin and therefore integrates
 * through a standard `[plugin, options]` tuple instead of a runtime instance.
 *
 * @see {@link PrimeVue}
 * @see {@link PrimeVueConfiguration}
 */
export type PrimeVueMountPlugin = [typeof PrimeVue, PrimeVueConfiguration];

/**
 * Configuration options for the PrimeVue 3 TestForge plugin.
 *
 * This type maps directly to the official PrimeVue 3 configuration object
 * and intentionally does not include TestForge runtime controls such as
 * `expose()` or `__meta.instance`, because PrimeVue does not create
 * a reusable runtime instance.
 *
 * @see {@link PrimeVueConfiguration}
 */
export type VueTestPrimeVueOptions = PrimeVueConfiguration;
