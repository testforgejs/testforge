import { validateCreateTestFrameworkOptions } from "../validateCreateTestFrameworkOptions.js";

import type { CreateTestFrameworkOptions } from "../../types";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Expect<T extends true> = T;

/**
 * 1. Verification of unknown narrowing
 *
 * The validator must narrow unknown options to CreateTestFrameworkOptions
 * after successful validation.
 */
const unknownOptions: unknown = {};

validateCreateTestFrameworkOptions(unknownOptions);

type _t1 = Expect<Equal<typeof unknownOptions, CreateTestFrameworkOptions>>;

/**
 * 2. Verification of single-preset options
 *
 * A configuration containing `preset` must be accepted as
 * CreateTestFrameworkOptions.
 */
const singlePresetOptions: unknown = {
  preset: {
    manifest: [],
    defaults: {},
  },
};

validateCreateTestFrameworkOptions(singlePresetOptions);

type _t2 = Expect<Equal<typeof singlePresetOptions, CreateTestFrameworkOptions>>;

/**
 * 3. Verification of multiple-preset options
 *
 * A configuration containing `presets` must be accepted as
 * CreateTestFrameworkOptions.
 */
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

type _t3 = Expect<Equal<typeof multiplePresetOptions, CreateTestFrameworkOptions>>;

/**
 * 4. Verification of shallowByDefault
 *
 * `shallowByDefault` is available on both variants of the options union.
 */
const shallowOptions: unknown = {
  shallowByDefault: true,
};

validateCreateTestFrameworkOptions(shallowOptions);

type _t4 = Expect<Equal<typeof shallowOptions, CreateTestFrameworkOptions>>;

/**
 * 5. Verification of combined single-preset options
 *
 * `preset` and `shallowByDefault` can be used together.
 */
const singlePresetWithShallow: unknown = {
  preset: {
    manifest: [],
    defaults: {},
  },
  shallowByDefault: true,
};

validateCreateTestFrameworkOptions(singlePresetWithShallow);

type _t5 = Expect<Equal<typeof singlePresetWithShallow, CreateTestFrameworkOptions>>;

/**
 * 6. Verification of combined multiple-preset options
 *
 * `presets` and `shallowByDefault` can be used together.
 */
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

type _t6 = Expect<Equal<typeof multiplePresetsWithShallow, CreateTestFrameworkOptions>>;
