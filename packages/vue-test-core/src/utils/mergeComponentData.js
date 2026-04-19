/**
 * Merges data (props or slots) according to a 4-level hierarchy.
 *
 * Order of layers (from lowest to highest):
 * 1. defaultMountData (from BASE_MOUNT_OPTIONS)
 * 2. defaultData (argument BASE_PROPS / BASE_SLOTS of the factory)
 * 3. mountData (from the mountOptions of a specific test)
 * 4. directData (direct argument of the factory call)
 *
 * @param {Object} params - Merge parameters.
 * @param {Object} [params.defaultMountData={}] - Data from the factory's base options (Level 1).
 * @param {Object} [params.defaultData={}] - Data from the factory's base arguments (Level 1).
 * @param {Object} [params.mountData={}] - Data from specific test options (Level 2).
 * @param {Object} [params.directData={}] -  Direct data from the specific test (Level 2).
 * @param {boolean} [params.skipDefault=false] - If true, completely ignores Level 1 (the test suite base).
 * @param {boolean} [params.skipOptions=false] - If true, ignores only defaultMountData.
 * @returns {Object} A merged data object.
 */
export function mergeComponentData({
  // Level 1 (Test Suite)
  defaultMountData = {},
  defaultData = {},
  // Level 2 (Specific Test)
  mountData = {},
  directData = {},
  // Control flags
  skipDefault = false,
  skipOptions = false,
}) {
  // If skipDefault is enabled, completely ignore the test suite level
  const level1 = skipDefault
    ? {}
    : {
        ...(!skipOptions ? defaultMountData : {}),
        ...defaultData,
      };

  // The test level is always active and takes precedence
  const level2 = {
    ...mountData,
    ...directData,
  };

  return { ...level1, ...level2 };
}
