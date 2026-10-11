import { test } from "vitest";

import { validateCreateTestFrameworkOptions } from "../validateCreateTestFrameworkOptions.js";

import type { CreateTestFrameworkOptions } from "../../types";
import type { Equal, Expect } from "../../../tests/utils/type-utils.js";

/**
 * The validator must narrow unknown options to CreateTestFrameworkOptions
 * after successful validation.
 */
test("should narrow unknown to CreateTestFrameworkOptions", () => {
  const unknownOptions: unknown = {};

  validateCreateTestFrameworkOptions(unknownOptions);

  type _Result = Expect<Equal<typeof unknownOptions, CreateTestFrameworkOptions>>;
});

/**
 * A configuration containing `preset` must be accepted as
 * CreateTestFrameworkOptions.
 */
test("should narrow single-preset options to CreateTestFrameworkOptions", () => {
  const singlePresetOptions: unknown = {
    preset: {
      manifest: [],
      defaults: {},
    },
  };

  validateCreateTestFrameworkOptions(singlePresetOptions);

  type _Result = Expect<Equal<typeof singlePresetOptions, CreateTestFrameworkOptions>>;
});

/**
 * A configuration containing `presets` must be accepted as
 * CreateTestFrameworkOptions.
 */
test("should narrow multiple-preset options to CreateTestFrameworkOptions", () => {
  const multiplePresetOptions: unknown = {
    presets: {
      default: {
        manifest: [],
        defaults: {},
      },
      custom: {
        manifest: [],
        defaults: {},
      },
    },
  };

  validateCreateTestFrameworkOptions(multiplePresetOptions);

  type _Result = Expect<Equal<typeof multiplePresetOptions, CreateTestFrameworkOptions>>;
});

/**
 * `shallowByDefault` is available on both variants of the options union.
 */
test("should narrow options with shallowByDefault", () => {
  const shallowOptions: unknown = {
    shallowByDefault: true,
  };

  validateCreateTestFrameworkOptions(shallowOptions);

  type _Result = Expect<Equal<typeof shallowOptions, CreateTestFrameworkOptions>>;
});

/**
 * `preset` and `shallowByDefault` can be used together.
 */
test("should narrow single-preset options with shallowByDefault", () => {
  const singlePresetWithShallow: unknown = {
    preset: {
      manifest: [],
      defaults: {},
    },
    shallowByDefault: true,
  };

  validateCreateTestFrameworkOptions(singlePresetWithShallow);

  type _Result = Expect<Equal<typeof singlePresetWithShallow, CreateTestFrameworkOptions>>;
});

/**
 * `presets` and `shallowByDefault` can be used together.
 */
test("should narrow multiple-preset options with shallowByDefault", () => {
  const multiplePresetsWithShallow: unknown = {
    presets: {
      default: {
        manifest: [],
        defaults: {},
      },
    },
    shallowByDefault: false,
  };

  validateCreateTestFrameworkOptions(multiplePresetsWithShallow);

  type _Result = Expect<Equal<typeof multiplePresetsWithShallow, CreateTestFrameworkOptions>>;
});
