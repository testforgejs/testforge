/**
 * Asserts that the specified property has a unique value for every item.
 *
 * Throws an error identifying both packages when a duplicate is found.
 *
 * @param {Array<Record<string, unknown>>} items
 * @param {string} property
 */
export function assertUnique(items, property) {
  const values = new Map();

  for (const item of items) {
    const value = item[property];

    if (values.has(value)) {
      throw new Error(
        `Duplicate plugin ${property} "${value}" found in ` +
          `${values.get(value)} and ${item.packageName}`,
      );
    }

    values.set(value, item.packageName);
  }
}
