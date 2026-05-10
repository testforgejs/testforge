/**
 * Checks whether the element is a regular object (not an array and not null).
 * @param {*} item
 * @returns {boolean}
 */
function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

/**
 * IMPORTANT CONTRACT:
 *
 * This function performs selective recursive merge WITHOUT deep cloning.
 *
 * - Objects are merged only when both sides contain the same key.
 * - Objects that are not involved in merge keep their original references.
 * - Source objects are reused when target lacks the key.
 * - Primitives are replaced.
 *
 * This behavior is intentional and relied upon by the pipeline.
 *
 * @param {any} target - The target object or array to merge into.
 * @param {any} source - The source object or array to merge from.
 * @returns {any} The merged result.
 */
export function mergeConfigs(target, source) {
  if (!isObject(target) || !isObject(source)) {
    return Array.isArray(target) && Array.isArray(source)
      ? [...new Set([...target, ...source])]
      : source;
  }

  const output = { ...target };

  Object.keys(source).forEach((key) => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      output[key] = [...new Set([...targetValue, ...sourceValue])];
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      output[key] = mergeConfigs(targetValue, sourceValue);
    } else {
      output[key] = sourceValue;
    }
  });

  return output;
}
