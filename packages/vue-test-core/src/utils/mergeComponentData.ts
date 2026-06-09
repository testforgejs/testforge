import type { MergeComponentDataParams } from "../types";

/*
 * Merges data (props or slots) according to a 4-level hierarchy.
 *
 * Order of layers (from lowest to highest):
 * 1. defaultMountData (from BASE_MOUNT_OPTIONS)
 * 2. defaultData (argument BASE_PROPS / BASE_SLOTS of the factory)
 * 3. mountData (from the mountOptions of a specific test)
 * 4. directData (direct argument of the factory call)
 */
export function mergeComponentData<T extends object>({
  defaultMountData = {} as T,
  defaultData = {} as T,
  mountData = {} as T,
  directData = {} as T,
  skipDefault = false,
  skipOptions = false,
}: MergeComponentDataParams<T>): T {
  // If skipDefault is true → completely ignore test suite level
  const level1 = skipDefault
    ? {}
    : {
        ...(!skipOptions ? defaultMountData : {}),
        ...defaultData,
      };

  // Test level always has higher priority
  const level2 = {
    ...mountData,
    ...directData,
  };

  return { ...level1, ...level2 } as T;
}
