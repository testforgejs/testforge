import { test } from "vitest";

import { validatePreset } from "../validatePreset.js";

import type { PresetDefinition } from "../../../types";
import type { Equal, Expect } from "../../../../tests/utils/type-utils.js";

/**
 * The validator must narrow an unknown preset to PresetDefinition
 * after successful validation.
 */
test("should narrow unknown to PresetDefinition", () => {
  const unknownPreset: unknown = {
    manifest: [],
    defaults: {},
  };

  validatePreset("default", unknownPreset);

  type _Result = Expect<Equal<typeof unknownPreset, PresetDefinition>>;
});

/**
 * After validation, the complete PresetDefinition API must be available.
 */
test("should allow accessing PresetDefinition properties after narrowing", () => {
  const presetValue: unknown = {
    manifest: [],
    defaults: {},
  };

  validatePreset("default", presetValue);

  type _Manifest = Expect<Equal<typeof presetValue.manifest, PresetDefinition["manifest"]>>;

  type _Defaults = Expect<Equal<typeof presetValue.defaults, PresetDefinition["defaults"]>>;
});

/**
 * Existing PresetDefinition information must remain intact.
 */
test("should preserve the type of an already typed preset", () => {
  const typedPreset: PresetDefinition = {
    manifest: [],
    defaults: {},
  };

  validatePreset("typed", typedPreset);

  type _Result = Expect<Equal<typeof typedPreset, PresetDefinition>>;
});

/**
 * Preset names are arbitrary strings.
 */
test("should accept arbitrary string preset names", () => {
  const name: string = "custom-preset";

  const namedPreset: unknown = {
    manifest: [],
    defaults: {},
  };

  validatePreset(name, namedPreset);

  type _Result = Expect<Equal<typeof namedPreset, PresetDefinition>>;
});
