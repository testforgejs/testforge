import { DeepPartial } from "packages/vue-test-core/tests/utils/DeepPartial";
import type { PipelineContext, RuntimeContext } from "../../types";

export const createMockCtx = <T extends PipelineContext = RuntimeContext>(
  overrides: DeepPartial<T> = {},
): T => {
  const { result: resultOverride, ...override } = overrides;
  return {
    defaultMountOptions: {},
    mountOptions: {},
    extraOptions: {},
    supportedPlugins: {},
    preset: undefined,
    ...override,
    result: {
      mountOptions: {},
      global: {},
      pluginDefaultsState: {},
      plugins: {},
      ...resultOverride,
    },
  } as T;
};
