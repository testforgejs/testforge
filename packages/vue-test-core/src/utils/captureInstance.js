/**
 * Helper for capturing plugin instances created inside the test
 * plugin factory.
 *
 * This utility is typically used together with the `expose` option
 * supported by test plugins (Pinia, vue-i18n, Vue Router).
 *
 * It allows tests to obtain a reference to a plugin instance that
 * is created internally by the mounting infrastructure.
 *
 * Example:
 *
 * const i18nCapture = captureInstance()
 *
 * const factory = testComponentFactory(Component, {}, {
 *   plugins: {
 *     i18n: {
 *       locale: 'en',
 *       messages,
 *       ...i18nCapture
 *     }
 *   }
 * })
 *
 * const wrapper = factory()
 *
 * @returns {{
 *   expose: function(instance: any): void,
 *   readonly instance: any
 * }}
 */
export function captureInstance() {
    let instance

    return {
        expose(ins) {
            instance = ins
        },
        get instance() {
            return instance
        },
    }
}
