import { validatePreset } from '../validatePreset'

describe('validatePreset', () => {
    // Helpers for creating mock modules
    const createMockModule = (name) => ({
        getName: () => name,
        getDefinition: () => ({ create: () => ({}) }),
    })

    const mockPinia = createMockModule('pinia')
    const mockI18n = createMockModule('i18n')

    describe('valid presets', () => {
        it('should pass if the preset structure is correct', () => {
            const validPreset = {
                manifest: [
                    { module: mockPinia, enabled: true },
                    { module: mockI18n, enabled: false },
                ],
                defaults: {
                    pinia: { store: {} },
                    i18n: false,
                },
            }

            expect(() => validatePreset('default', validPreset)).not.toThrow()
        })

        it('should pass even if defaults are missing (optional field)', () => {
            const presetWithoutDefaults = {
                manifest: [{ module: mockPinia, enabled: true }],
            }
            expect(() =>
                validatePreset('minimal', presetWithoutDefaults)
            ).not.toThrow()
        })
    })

    describe('manifest validation', () => {
        it('should throw if preset is null or undefined', () => {
            expect(() => validatePreset('null-test', null)).toThrow(
                /is null or undefined/
            )
        })

        it('should throw if manifest is not an array', () => {
            const invalid = { manifest: 'not-an-array' }
            expect(() => validatePreset('bad-manifest', invalid)).toThrow(
                /must have a "manifest" array/
            )
        })

        it('should throw if a module in manifest is invalid', () => {
            const invalid = {
                manifest: [{ module: {}, enabled: true }], // An empty object instead of a module
            }
            expect(() => validatePreset('bad-module', invalid)).toThrow(
                /Invalid module at manifest\[0\]/
            )
        })

        it('should throw if duplicate plugin names exist in manifest', () => {
            const duplicate = {
                manifest: [
                    { module: mockPinia, enabled: true },
                    { module: mockPinia, enabled: false },
                ],
            }
            expect(() => validatePreset('dupe-test', duplicate)).toThrow(
                /Duplicate plugin "pinia"/
            )
        })

        it('should throw if enabled flag is not a boolean', () => {
            const invalid = {
                manifest: [{ module: mockPinia, enabled: 'yes' }],
            }
            expect(() => validatePreset('bad-enabled', invalid)).toThrow(
                /must have a boolean "enabled" flag/
            )
        })
    })

    describe('defaults consistency validation', () => {
        it('should throw if defaults contains a key not present in manifest', () => {
            const inconsistent = {
                manifest: [{ module: mockPinia, enabled: true }],
                defaults: {
                    router: { history: {} }, // The router is missing from the manifest
                },
            }
            expect(() => validatePreset('inconsistent', inconsistent)).toThrow(
                /contains defaults for unknown plugin "router"/
            )
        })

        it('should throw if a default value is not an object or false', () => {
            const badValue = {
                manifest: [{ module: mockPinia, enabled: true }],
                defaults: {
                    pinia: 123, // Should be an object or false
                },
            }
            expect(() => validatePreset('bad-value', badValue)).toThrow(
                /Expected Object or false, but received number/
            )
        })

        it('should throw if a default value is null', () => {
            const badValue = {
                manifest: [{ module: mockPinia, enabled: true }],
                defaults: {
                    pinia: null,
                },
            }
            expect(() => validatePreset('null-value', badValue)).toThrow(
                /Expected Object or false, but received object/
            )
        })
    })
})
