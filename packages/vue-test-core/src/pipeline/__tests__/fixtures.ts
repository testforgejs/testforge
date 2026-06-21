import type { PipelineContext, RuntimeContext } from "../../types";

export const createMockCtx = <T extends PipelineContext = RuntimeContext>(
  overrides: Partial<T> = {},
): T =>
  ({
    defaultMountOptions: {},
    mountOptions: {},
    extraOptions: {},
    supportedPlugins: {},
    preset: undefined,
    result: {
      mountOptions: {},
      global: {},
      pluginDefaultsState: {},
      plugins: {},
    },
    ...overrides,
  }) as T;
