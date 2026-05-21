import type { MountContext } from "../../src/types";
import type { DeepPartial } from "./DeepPartial";

export function createTestMountContext(overrides: DeepPartial<MountContext> = {}): MountContext {
  return {
    defaultMountOptions: {},
    mountOptions: {},
    extraOptions: {},
    supportedPlugins: {},
    preset: undefined,

    ...overrides,

    result: {
      mountOptions: {},
      global: {},
      pluginPresets: {},

      ...(overrides.result ?? {}),

      plugins: {
        ...(overrides.result?.plugins ?? {}),
      },
    },
  } as MountContext;
}
