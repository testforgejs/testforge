import { test } from "vitest";

import { validatePresets } from "../validatePresets.js";

import type { PresetDefinition, TestFrameworkPresets } from "../../../types.js";
import type { Equal, Expect } from "../../../../tests/utils/type-utils.js";

/**
 * The validator must narrow an unknown value to TestFrameworkPresets
 * after successful validation.
 */
test("should narrow unknown to TestFrameworkPresets", () => {
  const unknownPresets: unknown = {
    default: {
      manifest: [],
      defaults: {},
    },
  };

  validatePresets(unknownPresets);

  type _Result = Expect<Equal<typeof unknownPresets, TestFrameworkPresets>>;
});

/**
 * After validation, individual presets must be available as
 * PresetDefinition values.
 */
test("should allow accessing presets as PresetDefinition", () => {
  const presetsValue: unknown = {
    default: {
      manifest: [],
      defaults: {},
    },
  };

  validatePresets(presetsValue);

  const defaultPreset = presetsValue.default;

  type _Result = Expect<Equal<typeof defaultPreset, PresetDefinition>>;
});

/**
 * The registry must support arbitrary string preset names.
 */
test("should support multiple named presets", () => {
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

  type _Registry = Expect<Equal<typeof multiplePresets, TestFrameworkPresets>>;

  type _PiniaPreset = Expect<Equal<typeof multiplePresets.piniaPreset, PresetDefinition>>;

  type _I18nPreset = Expect<Equal<typeof multiplePresets.i18nPreset, PresetDefinition>>;
});

/**
 * Existing TestFrameworkPresets information must remain intact.
 */
test("should preserve the type of an already typed preset registry", () => {
  const typedPresets: TestFrameworkPresets = {
    default: {
      manifest: [],
      defaults: {},
    },
  };

  validatePresets(typedPresets);

  type _Result = Expect<Equal<typeof typedPresets, TestFrameworkPresets>>;
});

/**
 * An empty registry is a valid TestFrameworkPresets value.
 */
test("should accept an empty preset registry", () => {
  const emptyPresets: unknown = {};

  validatePresets(emptyPresets);

  type _Result = Expect<Equal<typeof emptyPresets, TestFrameworkPresets>>;
});

/**
 * Preset names are not restricted to predefined identifiers.
 */
test("should support custom preset names", () => {
  const customPresets: unknown = {
    "my-project-preset": {
      manifest: [],
      defaults: {},
    },
  };

  validatePresets(customPresets);

  type _Result = Expect<Equal<typeof customPresets, TestFrameworkPresets>>;
});
