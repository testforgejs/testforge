import { validatePreset } from './validatePreset'

/**
 * Retrieves the active preset based on the call parameters and the available set of presets.
 *
 * Logic of choice:
 * 1. If a name is specified in `extraOptions.preset`, it searches for it. If it cannot be found, it throws an error.
 * 2. If no name is specified, it attempts to return the preset named ‘default’.
 * 3. If the preset found exists, it is passed through `validatePreset`.
 *
 * @param {Object} [extraOptions] - Additional options for the factory call.
 * @param {string} [extraOptions.preset] - The name of the requested preset.
 * @param {TestFrameworkPresets} [presets={}] - List of available presets (Map: name -> definition).
 *
 * @throws {Error} If the preset specified by name is not found in the registry.
 *
 * @returns {PresetDefinition|undefined} The preset definition object, or undefined if ‘default’ is not found.
 */
export function getActivePreset(extraOptions, presets = {}) {
    const requestedPresetName = extraOptions?.preset?.trim()
    const activeName = requestedPresetName || 'default'
    const preset = presets[activeName]

    // If a user requests a preset that doesn't exist, an error will be thrown
    if (requestedPresetName && !preset) {
        throw new Error(
            `[withPreset] Requested preset "${requestedPresetName}" not found in available presets.`
        )
    }

    if (preset) {
        validatePreset(activeName, preset)
    }

    return preset
}
