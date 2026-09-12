import { validatePresets } from "../validatePresets.js";

import type { PresetDefinition, TestFrameworkPresets } from "../../../types";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Expect<T extends true> = T;

/**
 * 1. Verification of unknown narrowing
 *
 * The validator must narrow an unknown value to TestFrameworkPresets
 * after successful validation.
 */
const unknownPresets: unknown = {
  default: {
    manifest: [],
    defaults: {},
  },
};

validatePresets(unknownPresets);

type _t1 = Expect<Equal<typeof unknownPresets, TestFrameworkPresets>>;

/**
 * 2. Verification of preset access
 *
 * After validation, individual presets must be available as
 * PresetDefinition values.
 */
const presetsValue: unknown = {
  default: {
    manifest: [],
    defaults: {},
  },
};

validatePresets(presetsValue);

const defaultPreset = presetsValue.default;

type _t2 = Expect<Equal<typeof defaultPreset, PresetDefinition>>;

/**
 * 3. Verification of multiple presets
 *
 * The registry must support arbitrary string preset names.
 */
const multiplePresets: unknown = {
  default: {
    manifest: [],
    defaults: {},
  },
  piniaPreset: {
    manifest: [],
    defaults: {},
  },
  i18nPreset: {
    manifest: [],
    defaults: {},
  },
};

validatePresets(multiplePresets);

type _t3 = Expect<Equal<typeof multiplePresets, TestFrameworkPresets>>;

type _t4 = Expect<Equal<typeof multiplePresets.piniaPreset, PresetDefinition>>;

type _t5 = Expect<Equal<typeof multiplePresets.i18nPreset, PresetDefinition>>;

/**
 * 4. Verification with an already typed registry
 *
 * Existing TestFrameworkPresets information must remain intact.
 */
const typedPresets: TestFrameworkPresets = {
  default: {
    manifest: [],
    defaults: {},
  },
};

validatePresets(typedPresets);

type _t6 = Expect<Equal<typeof typedPresets, TestFrameworkPresets>>;

/**
 * 5. Empty preset registry
 *
 * An empty registry is a valid TestFrameworkPresets value.
 */
const emptyPresets: unknown = {};

validatePresets(emptyPresets);

type _t7 = Expect<Equal<typeof emptyPresets, TestFrameworkPresets>>;

/**
 * 6. No restrictions on PresetName
 */
const customPresets: unknown = {
  "my-project-preset": {
    manifest: [],
    defaults: {},
  },
};

validatePresets(customPresets);

type _t8 = Expect<Equal<typeof customPresets, TestFrameworkPresets>>;
