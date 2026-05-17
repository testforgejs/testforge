import { describe, it, expect, vi } from "vitest";
import { createPluginRegistry } from "../createPluginRegistry.js";

const createMockPluginModule = (name, definition = {}) => ({
  getName: vi.fn(() => name),
  getDefinition: vi.fn(() => definition),
});

describe("createPluginRegistry", () => {
  describe("initialization from manifest", () => {
    it("should initialize registry from manifest", () => {
      const modA = createMockPluginModule("A", { a: 1 });
      const modB = createMockPluginModule("B", { b: 2 });

      const registry = createPluginRegistry([{ module: modA }, { module: modB }]);

      expect(registry.has("A")).toBe(true);
      expect(registry.has("B")).toBe(true);
      expect(registry.get("A")).toEqual({ a: 1 });
      expect(registry.get("B")).toEqual({ b: 2 });
    });

    it("should ignore entries without module", () => {
      const mod = createMockPluginModule("Valid");

      const registry = createPluginRegistry([{ module: undefined }, {}, { module: mod }]);

      expect(registry.getNames()).toEqual(["Valid"]);
    });

    it("should handle duplicate names in initial manifest (last wins)", () => {
      const mod1 = createMockPluginModule("duplicate", { version: 1 });
      const mod2 = createMockPluginModule("duplicate", { version: 2 });
      const mod3 = createMockPluginModule("unique", { version: 3 });

      const registry = createPluginRegistry([{ module: mod1 }, { module: mod2 }, { module: mod3 }]);

      expect(registry.get("duplicate")).toEqual({ version: 2 });
      expect(registry.getNames()).toEqual(["duplicate", "unique"]); // порядок вставки
    });

    it("should not mutate original manifest", () => {
      const module = createMockPluginModule("Safe");
      const manifest = [{ module }];

      Object.freeze(manifest);
      Object.freeze(manifest[0]);

      expect(() => createPluginRegistry(manifest)).not.toThrow();
    });
  });

  describe("core API", () => {
    it("should return correct names and entries", () => {
      const modA = createMockPluginModule("A", { a: 1 });
      const modB = createMockPluginModule("B", { b: 2 });

      const registry = createPluginRegistry([{ module: modA }, { module: modB }]);

      expect(registry.getNames()).toEqual(["A", "B"]);

      const entries = Array.from(registry.entries());
      expect(entries).toEqual([
        ["A", { a: 1 }],
        ["B", { b: 2 }],
      ]);
    });

    it("should return undefined for non-existent plugin", () => {
      const registry = createPluginRegistry();

      expect(registry.get("non-existent")).toBeUndefined();
      expect(registry.has("non-existent")).toBe(false);
    });

    it("should return fresh arrays and iterators from getNames() and entries()", () => {
      const registry = createPluginRegistry([
        { module: createMockPluginModule("A") },
        { module: createMockPluginModule("B") },
      ]);

      const names1 = registry.getNames();
      const names2 = registry.getNames();

      expect(names1).toEqual(["A", "B"]);
      expect(names1).not.toBe(names2); // новый массив каждый раз

      const entries1 = Array.from(registry.entries());
      const entries2 = Array.from(registry.entries());
      expect(entries1).not.toBe(entries2);
    });
  });

  describe("register() method", () => {
    it("should allow registering plugins after creation", () => {
      const registry = createPluginRegistry();

      const mod = createMockPluginModule("Dynamic", { x: 42 });
      registry.register({ module: mod });

      expect(registry.has("Dynamic")).toBe(true);
      expect(registry.get("Dynamic")).toEqual({ x: 42 });
    });

    it("should overwrite plugin with the same name", () => {
      const first = createMockPluginModule("Dup", { v: 1 });
      const second = createMockPluginModule("Dup", { v: 2 });

      const registry = createPluginRegistry([{ module: first }]);
      registry.register({ module: second });

      expect(registry.get("Dup")).toEqual({ v: 2 });
    });

    it("should ignore entries without module when using register()", () => {
      const registry = createPluginRegistry();
      const validMod = createMockPluginModule("Valid");

      registry.register({ module: undefined });
      registry.register({});
      registry.register({ module: null });
      registry.register({ module: validMod });

      expect(registry.getNames()).toEqual(["Valid"]);
    });
  });

  describe("module interaction", () => {
    it("should call getName and getDefinition on module", () => {
      const mod = createMockPluginModule("Spy", {});

      createPluginRegistry([{ module: mod }]);

      expect(mod.getName).toHaveBeenCalled();
      expect(mod.getDefinition).toHaveBeenCalled();
    });

    it("should preserve reference to the definition object", () => {
      const definition = { foo: "bar", nested: { value: 42 } };
      const mod = createMockPluginModule("refTest", definition);

      const registry = createPluginRegistry([{ module: mod }]);

      const retrieved = registry.get("refTest");
      expect(retrieved).toBe(definition); // строго та же ссылка
    });
  });

  describe("error handling", () => {
    it("should throw if module.getName() or getDefinition() is not a function", () => {
      const badModule = {
        getName: () => "bad",
        // getDefinition
      };

      expect(() => createPluginRegistry([{ module: badModule }])).toThrow();
    });
  });
});
