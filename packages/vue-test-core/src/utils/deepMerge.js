/**
 * Checks whether the element is a regular object (not an array and not null).
 * @param {*} item
 * @returns {boolean}
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep merge: objects are merged, arrays are combined (without duplicates),
 * primitives are replaced.
 */
export function deepMerge(target, source) {
    if (!isObject(target) || !isObject(source)) {
        return Array.isArray(target) && Array.isArray(source)
            ? [...new Set([...target, ...source])]
            : source
    }

    const output = { ...target }

    Object.keys(source).forEach((key) => {
        const targetValue = target[key]
        const sourceValue = source[key]

        if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
            output[key] = [...new Set([...targetValue, ...sourceValue])]
        } else if (isObject(targetValue) && isObject(sourceValue)) {
            output[key] = deepMerge(targetValue, sourceValue)
        } else {
            output[key] = sourceValue
        }
    })

    return output
}
