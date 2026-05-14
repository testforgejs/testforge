import { describe, it, expect, vi } from "vitest";
import { createPlugins } from "../createPlugins.js";

describe("createPlugins", () => {
  const createMockPlugin = (name, instance = { id: `inst-${name}` }) => {
    const definition = {
      beforeCreate: vi.fn((ctx, opts) => ({ ...opts, modified: true })),
      create: vi.fn(() => instance),
      afterCreate: vi.fn(),
    };

    return {
      getName: () => name,
      getDefinition: () => definition,
    };
  };

  // ---------------------------------------------------------------------------
  // Manifest ↔ Options filtering
  // ---------------------------------------------------------------------------
  describe("manifest and options filtering", () => {
    it("should create plugins only when present in both manifest and options", () => {
      const mockPinia = createMockPlugin("pinia");
      const ctx = {
        preset: { manifest: [{ module: mockPinia, enabled: true }] },
      };

      const result = createPlugins({ pinia: {} }, ctx);

      expect(result).toHaveLength(1);
    });

    it("should skip plugins when they are set to false in options", () => {
      const mockI18n = createMockPlugin("i18n");
      const ctx = {
        preset: { manifest: [{ module: mockI18n, enabled: true }] },
      };

      const result = createPlugins({ i18n: false }, ctx);

      expect(result).toHaveLength(0);
      expect(mockI18n.getDefinition().create).not.toHaveBeenCalled();
    });

    it("should ignore options when plugins are not present in the manifest", () => {
      const mockPinia = createMockPlugin("pinia");
      const ctx = {
        preset: { manifest: [{ module: mockPinia, enabled: true }] },
      };

      const result = createPlugins({ pinia: {}, router: {} }, ctx);

      expect(result).toHaveLength(1);
    });

    it("should skip plugin when options are missing for that plugin", () => {
      const mockPinia = createMockPlugin("pinia");
      const ctx = {
        preset: { manifest: [{ module: mockPinia, enabled: true }] },
      };

      const result = createPlugins({}, ctx);

      expect(result).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Plugin lifecycle (beforeCreate → create → afterCreate)
  // ---------------------------------------------------------------------------
  describe("plugin lifecycle hooks", () => {
    it("should run beforeCreate, create and afterCreate in correct order", () => {
      const mockPinia = createMockPlugin("pinia");
      const ctx = {
        preset: { manifest: [{ module: mockPinia, enabled: true }] },
      };

      const options = { pinia: { some: "opt" } };
      const result = createPlugins(options, ctx);

      const def = mockPinia.getDefinition();

      expect(def.beforeCreate).toHaveBeenCalledWith(ctx, options.pinia);
      expect(def.create).toHaveBeenCalledWith({
        some: "opt",
        modified: true,
      });
      expect(def.afterCreate).toHaveBeenCalledWith(result[0], ctx);
    });

    it("should pass original options to create when beforeCreate is missing", () => {
      const definition = { create: vi.fn(() => ({})) };
      const plugin = {
        getName: () => "noBefore",
        getDefinition: () => definition,
      };

      const ctx = {
        preset: { manifest: [{ module: plugin, enabled: true }] },
      };

      createPlugins({ noBefore: { x: 1 } }, ctx);

      expect(definition.create).toHaveBeenCalledWith({ x: 1 });
    });

    it("should work correctly when optional hooks are missing", () => {
      const simplePlugin = {
        getName: () => "simple",
        getDefinition: () => ({
          create: () => ({ isSimple: true }),
        }),
      };

      const ctx = {
        preset: { manifest: [{ module: simplePlugin, enabled: true }] },
      };

      const result = createPlugins({ simple: {} }, ctx);

      expect(result[0]).toEqual({ isSimple: true });
    });
  });

  // ---------------------------------------------------------------------------
  // Pipeline contracts
  // ---------------------------------------------------------------------------
  describe("pipeline contracts", () => {
    it("should not mutate original options object", () => {
      const mock = createMockPlugin("pinia");
      const ctx = {
        preset: { manifest: [{ module: mock, enabled: true }] },
      };

      const options = { pinia: { a: 1 } };
      const snapshot = structuredClone(options);

      createPlugins(options, ctx);

      expect(options).toEqual(snapshot);
    });

    it("should create plugins in manifest order", () => {
      const calls = [];

      const make = (name) => ({
        getName: () => name,
        getDefinition: () => ({
          create: () => {
            calls.push(name);
            return {};
          },
        }),
      });

      const ctx = {
        preset: {
          manifest: [
            { module: make("A"), enabled: true },
            { module: make("B"), enabled: true },
          ],
        },
      };

      createPlugins({ A: {}, B: {} }, ctx);

      expect(calls).toEqual(["A", "B"]);
    });

    it("should fail fast when plugin create throws", () => {
      const badPlugin = {
        getName: () => "bad",
        getDefinition: () => ({
          create: () => {
            throw new Error("boom");
          },
        }),
      };

      const ctx = {
        preset: { manifest: [{ module: badPlugin, enabled: true }] },
      };

      expect(() => createPlugins({ bad: {} }, ctx)).toThrow("boom");
    });
  });
});
