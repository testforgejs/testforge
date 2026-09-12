import { expectAssignable, expectError } from "tsd";

import type { CreateTestFrameworkOptions } from "../dist/index";

expectAssignable<CreateTestFrameworkOptions>({
  preset: {
    manifest: [],
    defaults: {},
  },
});

expectAssignable<CreateTestFrameworkOptions>({
  presets: {
    default: {
      manifest: [],
      defaults: {},
    },
  },
});

expectAssignable<CreateTestFrameworkOptions>({
  shallowByDefault: true,
});

expectAssignable<CreateTestFrameworkOptions>({
  preset: {
    manifest: [],
    defaults: {},
  },
  shallowByDefault: true,
});

expectAssignable<CreateTestFrameworkOptions>({
  presets: {
    default: {
      manifest: [],
      defaults: {},
    },
  },
  shallowByDefault: false,
});

expectError<CreateTestFrameworkOptions>({
  preset: {
    manifest: [],
    defaults: {},
  },
  presets: {
    default: {
      manifest: [],
      defaults: {},
    },
  },
});
