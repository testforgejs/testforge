import type { PipelineContext } from "../../src/types";
import type { DeepPartial } from "./DeepPartial";

export function createTestPipelineContext(
  overrides: DeepPartial<PipelineContext> = {},
): PipelineContext {
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
  } as PipelineContext;
}
