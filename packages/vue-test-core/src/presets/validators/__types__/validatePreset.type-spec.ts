import { validatePreset } from "../validatePreset.js";

import type { PresetDefinition } from "../../../types";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Expect<T extends true> = T;

/**
 * 1. Verification of unknown narrowing
 *
 * The validator must narrow an unknown preset to PresetDefinition
 * after successful validation.
 */
const unknownPreset: unknown = {
  manifest: [],
  defaults: {},
};

validatePreset("default", unknownPreset);

type _t1 = Expect<Equal<typeof unknownPreset, PresetDefinition>>;

/**
 * 2. Verification of PresetDefinition property access
 *
 * After validation, the complete PresetDefinition API must be available.
 */
const presetValue: unknown = {
  manifest: [],
  defaults: {},
};

validatePreset("default", presetValue);

type _t2 = Expect<Equal<typeof presetValue.manifest, PresetDefinition["manifest"]>>;

type _t3 = Expect<Equal<typeof presetValue.defaults, PresetDefinition["defaults"]>>;

/**
 * 3. Verification with an already typed preset
 *
 * Existing PresetDefinition information must remain intact.
 */
const typedPreset: PresetDefinition = {
  manifest: [],
  defaults: {},
};

validatePreset("typed", typedPreset);

type _t4 = Expect<Equal<typeof typedPreset, PresetDefinition>>;

/**
 * 4. Verification of preset name
 *
 * Preset names are arbitrary strings.
 */
const name: string = "custom-preset";

const namedPreset: unknown = {
  manifest: [],
  defaults: {},
};

validatePreset(name, namedPreset);

type _t5 = Expect<Equal<typeof namedPreset, PresetDefinition>>;
