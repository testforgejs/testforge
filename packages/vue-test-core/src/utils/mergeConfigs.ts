import type { PlainObject } from "../types";

// Checks whether the element is a regular object (not an array and not null)
function isPlainObject(item: unknown): item is PlainObject {
  return !!item && typeof item === "object" && !Array.isArray(item);
}

/*
IMPORTANT CONTRACT:

Selective recursive merge WITHOUT deep cloning.

- Objects merge only on intersecting keys
- Non-intersecting objects keep original references
- Arrays are union-merged with unique values
- Primitives are replaced
*/
export function mergeConfigs<T extends PlainObject>(target: T, source: T): T {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return (
      Array.isArray(target) && Array.isArray(source) ? [...new Set([...target, ...source])] : source
    ) as T;
  }

  const output: PlainObject = { ...target };

  for (const key of Object.keys(source)) {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      output[key] = [...new Set([...targetValue, ...sourceValue])];
    } else if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      output[key] = mergeConfigs(targetValue as PlainObject, sourceValue as PlainObject);
    } else {
      output[key] = sourceValue;
    }
  }

  return output as T;
}
