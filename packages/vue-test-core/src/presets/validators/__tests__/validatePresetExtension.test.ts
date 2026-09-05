import { describe, expect, it } from "vitest";
import { validatePresetExtension } from "../validatePresetExtension.js";
import type { PresetDefinition, PresetExtension } from "../../../types";

const createPluginModule = (name: string) => ({
  getName: () => name,
  getDefinition: () => ({ create: () => null }),
});

const createBasePreset = (): PresetDefinition => ({
  manifest: [
    {
      module: createPluginModule("pinia") as any,
      enabled: true,
    },
  ],
  defaults: {
    pinia: () => ({
      stubActions: false,
    }),
  },
});

describe("validatePresetExtension", () => {
  // ─────────────────────────────────────────────
  // Null / undefined inputs
  // ─────────────────────────────────────────────
  describe("when base preset or extension is null or undefined", () => {
    it("should throw when base preset is null", () => {
      expect(() => validatePresetExtension(null as unknown as PresetDefinition, {})).toThrow(
        "[TestForge] Cannot extend a null or undefined preset.",
      );
    });

    it("should throw when base preset is undefined", () => {
      expect(() => validatePresetExtension(undefined as unknown as PresetDefinition, {})).toThrow(
        "[TestForge] Cannot extend a null or undefined preset.",
      );
    });

    it("should throw when extension is null", () => {
      expect(() =>
        validatePresetExtension(createBasePreset(), null as unknown as PresetExtension),
      ).toThrow("[TestForge] Preset extension is null or undefined.");
    });

    it("should throw when extension is undefined", () => {
      expect(() =>
        validatePresetExtension(createBasePreset(), undefined as unknown as PresetExtension),
      ).toThrow("[TestForge] Preset extension is null or undefined.");
    });
  });

  // ─────────────────────────────────────────────
  // New plugins
  // ─────────────────────────────────────────────
  describe("when adding a new plugin", () => {
    it("should throw when enabled is not specified", () => {
      const extension: PresetExtension = {
        manifest: [
          {
            module: createPluginModule("router") as any,
            enabled: undefined as any,
          },
        ],
        defaults: {
          router: () => ({}),
        },
      };

      expect(() => validatePresetExtension(createBasePreset(), extension)).toThrow(
        '[TestForge] Cannot add plugin "router" to an extended preset without specifying "enabled".',
      );
    });

    it("should throw when defaults are missing", () => {
      const extension: PresetExtension = {
        manifest: [
          {
            module: createPluginModule("router") as any,
            enabled: true,
          },
        ],
        defaults: {},
      };

      expect(() => validatePresetExtension(createBasePreset(), extension)).toThrow(
        '[TestForge] Cannot add plugin "router" to an extended preset without defining its defaults.',
      );
    });

    it("should accept when enabled and defaults are provided", () => {
      const extension: PresetExtension = {
        manifest: [
          {
            module: createPluginModule("router") as any,
            enabled: true,
          },
        ],
        defaults: {
          router: () => ({
            routes: [],
          }),
        },
      };

      expect(() => validatePresetExtension(createBasePreset(), extension)).not.toThrow();
    });

    it("should accept when enabled is false and defaults are provided", () => {
      const extension: PresetExtension = {
        manifest: [
          {
            module: createPluginModule("router") as any,
            enabled: false,
          },
        ],
        defaults: {
          router: () => ({}),
        },
      };

      expect(() => validatePresetExtension(createBasePreset(), extension)).not.toThrow();
    });
  });

  // ─────────────────────────────────────────────
  // Defaults validation
  // ─────────────────────────────────────────────
  describe("when validating defaults", () => {
    it("should throw when a plugin default is not a plugin options factory", () => {
      const extension = {
        defaults: {
          pinia: false,
        },
      } as unknown as PresetExtension;

      expect(() => validatePresetExtension(createBasePreset(), extension)).toThrow(
        '[TestForge] Invalid defaults for plugin "pinia". ' +
          "Preset defaults must be provided as a plugin options factory function.",
      );
    });

    it("should throw when defaults reference an unknown plugin", () => {
      const extension: PresetExtension = {
        defaults: {
          router: () => ({}),
        },
      };

      expect(() => validatePresetExtension(createBasePreset(), extension)).toThrow(
        '[TestForge] Cannot define defaults for unknown plugin "router" in a preset extension. The plugin must be declared in the manifest.',
      );
    });

    it("should accept defaults for a plugin from the base preset", () => {
      const extension: PresetExtension = {
        defaults: {
          pinia: () => ({
            stubActions: true,
          }),
        },
      };

      expect(() => validatePresetExtension(createBasePreset(), extension)).not.toThrow();
    });
  });

  // ─────────────────────────────────────────────
  // Duplicate plugins
  // ─────────────────────────────────────────────
  describe("when extension manifest contains duplicates", () => {
    it("should throw when the same plugin appears twice", () => {
      const extension: PresetExtension = {
        manifest: [
          {
            module: createPluginModule("router") as any,
            enabled: true,
          },
          {
            module: createPluginModule("router") as any,
            enabled: false,
          },
        ],
        defaults: {
          router: () => ({}),
        },
      };

      expect(() => validatePresetExtension(createBasePreset(), extension)).toThrow(
        '[TestForge] Duplicate plugin "router" in preset extension manifest.',
      );
    });
  });

  // ─────────────────────────────────────────────
  // Valid extensions
  // ─────────────────────────────────────────────
  describe("when extension is valid", () => {
    it("should accept overriding an existing plugin", () => {
      const extension: PresetExtension = {
        manifest: [
          {
            module: createPluginModule("pinia") as any,
            enabled: false,
          },
        ],
        defaults: {
          pinia: () => ({
            stubActions: true,
          }),
        },
      };

      expect(() => validatePresetExtension(createBasePreset(), extension)).not.toThrow();
    });

    it("should accept changing enabled of an existing plugin without providing defaults", () => {
      const extension: PresetExtension = {
        manifest: [
          {
            module: createPluginModule("pinia") as any,
            enabled: false,
          },
        ],
      };

      expect(() => validatePresetExtension(createBasePreset(), extension)).not.toThrow();
    });

    it("should accept an extension with neither manifest nor defaults", () => {
      expect(() => validatePresetExtension(createBasePreset(), {})).not.toThrow();
    });

    it("should accept overriding enabled of an existing plugin", () => {
      const extension: PresetExtension = {
        manifest: [
          {
            module: createPluginModule("pinia") as any,
            enabled: true,
          },
        ],
        defaults: {
          pinia: () => ({
            stubActions: true,
          }),
        },
      };

      expect(() => validatePresetExtension(createBasePreset(), extension)).not.toThrow();
    });
  });
});
