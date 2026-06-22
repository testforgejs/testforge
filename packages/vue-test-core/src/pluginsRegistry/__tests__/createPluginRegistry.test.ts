import { describe, it, expect, vi } from "vitest";
import { createPluginRegistry } from "../createPluginRegistry.js";

import type { PluginDefinition, PluginManifestEntry, PluginModule } from "../../types";

export const createMockPluginDefinition = (
  overrides: Partial<PluginDefinition> = {},
): PluginDefinition => ({
  create: vi.fn(),
  ...overrides,
});

const createMockPluginModule = (
  name: string,
  definition: PluginDefinition = createMockPluginDefinition(),
): PluginModule => ({
  getName: vi.fn(() => name),
  getDefinition: vi.fn(() => definition),
});

describe("createPluginRegistry", () => {
  describe("initialization from manifest", () => {
    it("should initialize registry from manifest", () => {
      const defA = {
        create: vi.fn(),
        beforeCreate: vi.fn(),
      };

      const defB = {
        create: vi.fn(),
        afterCreate: vi.fn(),
      };
      const modA = createMockPluginModule("A", defA);
      const modB = createMockPluginModule("B", defB);

      const registry = createPluginRegistry([
        { module: modA, enabled: true },
        { module: modB, enabled: true },
      ]);

      expect(registry.get("A")).toBe(defA);
      expect(registry.get("B")).toBe(defB);
    });

    it("should ignore entries without module", () => {
      const mod = createMockPluginModule("Valid");

      const registry = createPluginRegistry([
        { module: undefined as unknown as PluginModule, enabled: true },
        { enabled: true } as PluginManifestEntry,
        { module: mod, enabled: true },
      ]);

      expect(registry.getNames()).toEqual(["Valid"]);
    });

    it("should handle duplicate names in initial manifest (last wins)", () => {
      const def1 = createMockPluginDefinition();
      const def2 = createMockPluginDefinition();
      const def3 = createMockPluginDefinition();

      const mod1 = createMockPluginModule("duplicate", def1);
      const mod2 = createMockPluginModule("duplicate", def2);
      const mod3 = createMockPluginModule("unique", def3);

      const registry = createPluginRegistry([
        { module: mod1, enabled: true },
        { module: mod2, enabled: true },
        { module: mod3, enabled: true },
      ]);

      expect(registry.get("duplicate")).toBe(def2);
      expect(registry.get("unique")).toBe(def3);

      expect(registry.getNames()).toEqual(["duplicate", "unique"]);
    });

    it("should not mutate original manifest", () => {
      const module = createMockPluginModule("Safe");
      const manifest: PluginManifestEntry[] = [{ module, enabled: true }];

      Object.freeze(manifest);
      Object.freeze(manifest[0]);

      expect(() => createPluginRegistry(manifest)).not.toThrow();
    });
  });

  describe("core API", () => {
    it("should return correct names and entries", () => {
      const defA = createMockPluginDefinition();
      const defB = createMockPluginDefinition();

      const modA = createMockPluginModule("A", defA);
      const modB = createMockPluginModule("B", defB);

      const registry = createPluginRegistry([
        { module: modA, enabled: true },
        { module: modB, enabled: true },
      ]);

      expect(registry.getNames()).toEqual(["A", "B"]);

      const entries = Array.from(registry.entries());
      expect(entries).toEqual([
        ["A", defA],
        ["B", defB],
      ]);
    });

    it("should return undefined for non-existent plugin", () => {
      const registry = createPluginRegistry();

      expect(registry.get("non-existent")).toBeUndefined();
      expect(registry.has("non-existent")).toBe(false);
    });

    it("should return fresh arrays and iterators from getNames() and entries()", () => {
      const registry = createPluginRegistry([
        { module: createMockPluginModule("A"), enabled: true },
        { module: createMockPluginModule("B"), enabled: false },
      ]);

      const names1 = registry.getNames();
      const names2 = registry.getNames();

      expect(names1).toEqual(["A", "B"]);
      expect(names1).not.toBe(names2);

      const entries1 = Array.from(registry.entries());
      const entries2 = Array.from(registry.entries());
      expect(entries1).not.toBe(entries2);
    });
  });

  describe("register() method", () => {
    it("should allow registering plugins after creation", () => {
      const registry = createPluginRegistry();

      const defDyn = createMockPluginDefinition();
      const mod = createMockPluginModule("Dynamic", defDyn);
      registry.register({ module: mod, enabled: false });

      expect(registry.has("Dynamic")).toBe(true);
      expect(registry.get("Dynamic")).toBe(defDyn);
    });

    it("should overwrite plugin with the same name", () => {
      const def1 = createMockPluginDefinition();
      const def2 = createMockPluginDefinition();
      const first = createMockPluginModule("Dup", def1);
      const second = createMockPluginModule("Dup", def2);

      const registry = createPluginRegistry([{ module: first, enabled: true }]);
      registry.register({ module: second, enabled: true });

      expect(registry.get("Dup")).toBe(def2);
    });

    it("should ignore entries without module when using register()", () => {
      const registry = createPluginRegistry();
      const validMod = createMockPluginModule("Valid");

      registry.register({ module: undefined as unknown as PluginModule, enabled: true });
      registry.register({} as PluginManifestEntry);
      registry.register({ module: null as unknown as PluginModule, enabled: true });
      registry.register({ module: validMod, enabled: true });

      expect(registry.getNames()).toEqual(["Valid"]);
    });
  });

  describe("module interaction", () => {
    it("should call getName and getDefinition on module", () => {
      const mod = createMockPluginModule("Spy");

      createPluginRegistry([{ module: mod, enabled: true }]);

      expect(mod.getName).toHaveBeenCalled();
      expect(mod.getDefinition).toHaveBeenCalled();
    });

    it("should preserve reference to the definition object", () => {
      const definition = createMockPluginDefinition();
      const mod = createMockPluginModule("refTest", definition);

      const registry = createPluginRegistry([{ module: mod, enabled: true }]);

      const retrieved = registry.get("refTest");
      expect(retrieved).toBe(definition);
    });
  });

  describe("error handling", () => {
    it("should throw if module.getName() or getDefinition() is not a function", () => {
      const badModule = {
        getName: () => "bad",
        // getDefinition
      };

      expect(() =>
        createPluginRegistry([{ module: badModule as PluginModule, enabled: true }]),
      ).toThrow();
    });
  });
});
