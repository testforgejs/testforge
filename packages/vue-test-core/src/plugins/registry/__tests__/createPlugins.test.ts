import { describe, expect, it, vi } from "vitest";

import { ERROR_PREFIX } from "../../../constants/constants.js";
import { fromPluginInstance } from "../../../plugins/dependencies/fromPluginInstance.js";
import { createMockCtx } from "../../../pipeline/__tests__/fixtures.js";
import { createPlugins } from "../../../plugins/registry/createPlugins.js";

interface CreatePluginsDependencyAInstance {
  id: string;
}

interface CreatePluginsDependencyBInstance {
  id: string;
}

interface CreatePluginsSourceInstance {
  id: string;
}

declare module "../../../types.js" {
  interface PluginOptionsMap {
    createPluginsDependencyA: object;
    createPluginsDependencyB: object;
    createPluginsSource: object;
  }

  interface PluginInstanceMap {
    createPluginsDependencyA: CreatePluginsDependencyAInstance;
    createPluginsDependencyB: CreatePluginsDependencyBInstance;
    createPluginsSource: CreatePluginsSourceInstance;
  }
}

describe("createPlugins", () => {
  const createMockPlugin = (
    name: string,
    createdPlugin = { id: `inst-${name}` },
    supportsInstanceReferences = false,
  ) => {
    const definition = {
      beforeCreate: vi.fn((ctx, opts) => ({
        ...opts,
        modified: true,
      })),
      create: vi.fn(() => createdPlugin),
      afterCreate: vi.fn(),
      ...(supportsInstanceReferences ? { supportsInstanceReferences: true as const } : {}),
    };

    return {
      getName: () => name,
      getDefinition: () => definition,
      getDefaultOptions: () => () => ({}),
    };
  };

  // ---------------------------------------------------------------------------
  // Manifest ↔ Options filtering
  // ---------------------------------------------------------------------------
  describe("manifest and options filtering", () => {
    it("should create plugins only when present in both manifest and options", () => {
      const mockPinia = createMockPlugin("pinia");

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: mockPinia,
              enabled: true,
            },
          ],
          defaults: {
            pinia: () => ({}),
          },
        },
      });

      const result = createPlugins(
        {
          pinia: {},
        },
        ctx,
      );

      expect(result).toHaveLength(1);
    });

    it("should skip plugins when they are set to false in options", () => {
      const mockI18n = createMockPlugin("i18n");

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: mockI18n,
              enabled: true,
            },
          ],
          defaults: {
            i18n: () => ({}),
          },
        },
      });

      const result = createPlugins(
        {
          i18n: false,
        },
        ctx,
      );

      expect(result).toHaveLength(0);
      expect(mockI18n.getDefinition().create).not.toHaveBeenCalled();
    });

    it("should ignore options when plugins are not present in the manifest", () => {
      const mockPinia = createMockPlugin("pinia");

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: mockPinia,
              enabled: true,
            },
          ],
          defaults: {
            pinia: () => ({}),
          },
        },
      });

      const result = createPlugins(
        {
          pinia: {},
          router: {},
        },
        ctx,
      );

      expect(result).toHaveLength(1);
    });

    it("should skip plugin when options are missing for that plugin", () => {
      const mockPinia = createMockPlugin("pinia");

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: mockPinia,
              enabled: true,
            },
          ],
          defaults: {
            pinia: () => ({}),
          },
        },
      });

      const result = createPlugins({}, ctx);

      expect(result).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Plugin lifecycle (beforeCreate → create → afterCreate)
  // ---------------------------------------------------------------------------
  describe("plugin lifecycle hooks", () => {
    it("should run beforeCreate, create and afterCreate with the expected arguments", () => {
      const mockPinia = createMockPlugin("pinia");

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: mockPinia,
              enabled: true,
            },
          ],
          defaults: {
            pinia: () => ({}),
          },
        },
      });

      const options = {
        pinia: {
          some: "opt",
        },
      };

      const result = createPlugins(options, ctx);

      const definition = mockPinia.getDefinition();

      expect(definition.beforeCreate).toHaveBeenCalledWith(ctx, options.pinia);

      expect(definition.create).toHaveBeenCalledWith({
        some: "opt",
        modified: true,
      });

      expect(definition.afterCreate).toHaveBeenCalledWith(result[0], ctx);
    });

    it("should run lifecycle hooks in the correct order", () => {
      const calls: string[] = [];

      const definition = {
        beforeCreate: vi.fn((ctx, opts) => {
          calls.push("beforeCreate");

          return {
            ...opts,
            modified: true,
          };
        }),

        create: vi.fn((opts) => {
          calls.push("create");

          return {
            instance: true,
            opts,
          };
        }),

        afterCreate: vi.fn(() => {
          calls.push("afterCreate");
        }),
      };

      const mockPinia = {
        getName: () => "pinia",
        getDefinition: () => definition,
        getDefaultOptions: () => () => ({}),
      };

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: mockPinia,
              enabled: true,
            },
          ],
          defaults: {
            pinia: () => ({}),
          },
        },
      });

      createPlugins(
        {
          pinia: {
            some: "opt",
          },
        },
        ctx,
      );

      expect(calls).toEqual(["beforeCreate", "create", "afterCreate"]);
    });

    it("should pass original options to create when beforeCreate is missing", () => {
      const definition = {
        create: vi.fn(() => ({})),
      };

      const plugin = {
        getName: () => "noBefore",
        getDefinition: () => definition,
        getDefaultOptions: () => () => ({}),
      };

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: plugin,
              enabled: true,
            },
          ],
          defaults: {
            noBefore: () => ({}),
          },
        },
      });

      createPlugins(
        {
          noBefore: {
            x: 1,
          },
        },
        ctx,
      );

      expect(definition.create).toHaveBeenCalledWith({
        x: 1,
      });
    });

    it("should work correctly when optional hooks are missing", () => {
      const simplePlugin = {
        getName: () => "simple",
        getDefinition: () => ({
          create: () => ({
            isSimple: true,
          }),
        }),
        getDefaultOptions: () => () => ({}),
      };

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: simplePlugin,
              enabled: true,
            },
          ],
          defaults: {
            simple: () => ({}),
          },
        },
      });

      const result = createPlugins(
        {
          simple: {},
        },
        ctx,
      );

      expect(result[0]).toEqual({
        isSimple: true,
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Plugin dependency ordering
  // ---------------------------------------------------------------------------
  describe("plugin dependency ordering", () => {
    it("should preserve manifest order when plugins are independent", () => {
      const calls: string[] = [];

      const make = (name: string) => ({
        getName: () => name,
        getDefinition: () => ({
          create: () => {
            calls.push(name);

            return {};
          },
        }),
        getDefaultOptions: () => () => ({}),
      });

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: make("A"),
              enabled: true,
            },
            {
              module: make("B"),
              enabled: true,
            },
          ],
          defaults: {
            A: () => ({}),
            B: () => ({}),
          },
        },
      });

      createPlugins(
        {
          A: {},
          B: {},
        },
        ctx,
      );

      expect(calls).toEqual(["A", "B"]);
    });

    it("should create a dependency before the plugin that depends on it", () => {
      const calls: string[] = [];

      const dependency = createMockPlugin(
        "createPluginsDependencyA",
        {
          id: "dependencyA",
        },
        true,
      );

      const source = createMockPlugin("createPluginsSource", {
        id: "source",
      });

      dependency.getDefinition().create.mockImplementation(() => {
        calls.push("createPluginsDependencyA");

        return {
          id: "dependencyA",
        };
      });

      source.getDefinition().create.mockImplementation(() => {
        calls.push("createPluginsSource");

        return {
          id: "source",
        };
      });

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: source,
              enabled: true,
            },
            {
              module: dependency,
              enabled: true,
            },
          ],
          defaults: {
            createPluginsSource: () => ({}),
            createPluginsDependencyA: () => ({}),
          },
        },
      });

      createPlugins(
        {
          createPluginsSource: {
            dependency: fromPluginInstance("createPluginsDependencyA", (instance) => instance.id),
          },
          createPluginsDependencyA: {},
        },
        ctx,
      );

      expect(calls).toEqual(["createPluginsDependencyA", "createPluginsSource"]);
    });

    it("should create transitive dependencies in dependency order", () => {
      const calls: string[] = [];

      const dependencyA = createMockPlugin(
        "createPluginsDependencyA",
        {
          id: "dependencyA",
        },
        true,
      );

      const dependencyB = createMockPlugin(
        "createPluginsDependencyB",
        {
          id: "dependencyB",
        },
        true,
      );

      const source = createMockPlugin("createPluginsSource", {
        id: "source",
      });

      dependencyA.getDefinition().create.mockImplementation(() => {
        calls.push("createPluginsDependencyA");

        return {
          id: "dependencyA",
        };
      });

      dependencyB.getDefinition().create.mockImplementation(() => {
        calls.push("createPluginsDependencyB");

        return {
          id: "dependencyB",
        };
      });

      source.getDefinition().create.mockImplementation(() => {
        calls.push("createPluginsSource");

        return {
          id: "source",
        };
      });

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: source,
              enabled: true,
            },
            {
              module: dependencyB,
              enabled: true,
            },
            {
              module: dependencyA,
              enabled: true,
            },
          ],
          defaults: {
            createPluginsSource: () => ({}),
            createPluginsDependencyB: () => ({}),
            createPluginsDependencyA: () => ({}),
          },
        },
      });

      createPlugins(
        {
          createPluginsSource: {
            dependency: fromPluginInstance("createPluginsDependencyB", (instance) => instance.id),
          },
          createPluginsDependencyB: {
            dependency: fromPluginInstance("createPluginsDependencyA", (instance) => instance.id),
          },
          createPluginsDependencyA: {},
        },
        ctx,
      );

      expect(calls).toEqual([
        "createPluginsDependencyA",
        "createPluginsDependencyB",
        "createPluginsSource",
      ]);
    });

    it("should fail before creation when a required dependency is inactive", () => {
      const dependency = createMockPlugin("createPluginsDependencyA", { id: "dependencyA" }, true);

      const source = createMockPlugin("createPluginsSource");

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: source,
              enabled: true,
            },
            {
              module: dependency,
              enabled: true,
            },
          ],
          defaults: {
            createPluginsSource: () => ({}),
            createPluginsDependencyA: () => ({}),
          },
        },
      });

      expect(() =>
        createPlugins(
          {
            createPluginsSource: {
              dependency: fromPluginInstance("createPluginsDependencyA", (instance) => instance.id),
            },
            createPluginsDependencyA: false,
          },
          ctx,
        ),
      ).toThrow(
        `${ERROR_PREFIX} Plugin "createPluginsSource" depends on inactive plugin "createPluginsDependencyA".`,
      );

      expect(source.getDefinition().create).not.toHaveBeenCalled();

      expect(dependency.getDefinition().create).not.toHaveBeenCalled();
    });

    it("should fail before creation when plugin dependencies are circular", () => {
      const dependency = createMockPlugin("createPluginsDependencyA", { id: "dependencyA" }, true);

      const source = createMockPlugin("createPluginsSource");

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: source,
              enabled: true,
            },
            {
              module: dependency,
              enabled: true,
            },
          ],
          defaults: {
            createPluginsSource: () => ({}),
            createPluginsDependencyA: () => ({}),
          },
        },
      });

      expect(() =>
        createPlugins(
          {
            createPluginsSource: {
              dependency: fromPluginInstance("createPluginsDependencyA", (instance) => instance.id),
            },
            createPluginsDependencyA: {
              dependency: fromPluginInstance("createPluginsSource", (instance) => instance.id),
            },
          },
          ctx,
        ),
      ).toThrow(/Circular plugin dependency detected/);

      expect(source.getDefinition().create).not.toHaveBeenCalled();

      expect(dependency.getDefinition().create).not.toHaveBeenCalled();
    });

    it("should fail before creation when a dependency does not support instance references", () => {
      const dependency = createMockPlugin("createPluginsDependencyA", {
        id: "dependencyA",
      });

      const source = createMockPlugin("createPluginsSource", {
        id: "source",
      });

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: source,
              enabled: true,
            },
            {
              module: dependency,
              enabled: true,
            },
          ],
          defaults: {
            createPluginsSource: () => ({}),
            createPluginsDependencyA: () => ({}),
          },
        },
      });

      expect(() =>
        createPlugins(
          {
            createPluginsSource: {
              dependency: fromPluginInstance("createPluginsDependencyA", (instance) => instance.id),
            },
            createPluginsDependencyA: {},
          },
          ctx,
        ),
      ).toThrow(
        `${ERROR_PREFIX} Plugin "createPluginsSource" depends on plugin "createPluginsDependencyA", which does not support instance references.`,
      );

      expect(source.getDefinition().create).not.toHaveBeenCalled();
      expect(dependency.getDefinition().create).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Pipeline contracts
  // ---------------------------------------------------------------------------
  describe("pipeline contracts", () => {
    it("should not mutate original options object", () => {
      const mock = createMockPlugin("pinia");

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: mock,
              enabled: true,
            },
          ],
          defaults: {
            pinia: () => ({}),
          },
        },
      });

      const options = {
        pinia: {
          a: 1,
        },
      };

      const snapshot = structuredClone(options);

      createPlugins(options, ctx);

      expect(options).toEqual(snapshot);
    });

    it("should resolve plugin instance references before lifecycle hooks without mutating source options", () => {
      const dependency = createMockPlugin(
        "createPluginsDependencyA",
        {
          id: "dependencyA",
        },
        true,
      );

      const source = createMockPlugin("createPluginsSource", {
        id: "source",
      });

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: source,
              enabled: true,
            },
            {
              module: dependency,
              enabled: true,
            },
          ],
          defaults: {
            createPluginsSource: () => ({}),
            createPluginsDependencyA: () => ({}),
          },
        },
      });

      const reference = fromPluginInstance("createPluginsDependencyA", (instance) => instance.id);

      const options = {
        createPluginsSource: {
          dependency: reference,
        },
        createPluginsDependencyA: {},
      };

      createPlugins(options, ctx);

      const sourceDefinition = source.getDefinition();

      expect(sourceDefinition.beforeCreate).toHaveBeenCalledWith(ctx, {
        dependency: "dependencyA",
      });

      expect(sourceDefinition.create).toHaveBeenCalledWith({
        dependency: "dependencyA",
        modified: true,
      });

      expect(options.createPluginsSource.dependency).toBe(reference);
    });

    it("should resolve plugin instance references independently across repeated calls", () => {
      const dependency = createMockPlugin(
        "createPluginsDependencyA",
        {
          id: "unused",
        },
        true,
      );

      dependency
        .getDefinition()
        .create.mockImplementationOnce(() => ({
          id: "first-instance",
        }))
        .mockImplementationOnce(() => ({
          id: "second-instance",
        }));

      const source = createMockPlugin("createPluginsSource", {
        id: "source",
      });

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: source,
              enabled: true,
            },
            {
              module: dependency,
              enabled: true,
            },
          ],
          defaults: {
            createPluginsSource: () => ({}),
            createPluginsDependencyA: () => ({}),
          },
        },
      });

      const reference = fromPluginInstance("createPluginsDependencyA", (instance) => instance.id);

      const options = {
        createPluginsSource: {
          dependency: reference,
        },
        createPluginsDependencyA: {},
      };

      createPlugins(options, ctx);
      createPlugins(options, ctx);

      const sourceDefinition = source.getDefinition();

      expect(sourceDefinition.beforeCreate).toHaveBeenNthCalledWith(1, ctx, {
        dependency: "first-instance",
      });

      expect(sourceDefinition.beforeCreate).toHaveBeenNthCalledWith(2, ctx, {
        dependency: "second-instance",
      });

      expect(options.createPluginsSource.dependency).toBe(reference);
    });

    it("should preserve runtime value identity while resolving sibling references", () => {
      const dependency = createMockPlugin(
        "createPluginsDependencyA",
        {
          id: "dependencyA",
        },
        true,
      );

      const source = createMockPlugin("createPluginsSource", {
        id: "source",
      });

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: source,
              enabled: true,
            },
            {
              module: dependency,
              enabled: true,
            },
          ],
          defaults: {
            createPluginsSource: () => ({}),
            createPluginsDependencyA: () => ({}),
          },
        },
      });

      const sharedInstance = {
        id: "shared",
        install: () => {},
      };

      const options = {
        createPluginsSource: {
          sharedInstance,
          dependency: fromPluginInstance("createPluginsDependencyA", (instance) => instance.id),
        },
        createPluginsDependencyA: {},
      };

      createPlugins(options, ctx);

      expect(source.getDefinition().beforeCreate).toHaveBeenCalledWith(
        ctx,
        expect.objectContaining({
          sharedInstance,
          dependency: "dependencyA",
        }),
      );

      const resolvedOptions = source.getDefinition().beforeCreate.mock.calls[0][1];

      expect(resolvedOptions).not.toBe(options.createPluginsSource);

      expect(resolvedOptions.sharedInstance).toBe(sharedInstance);
    });

    it("should stop plugin creation when plugin create throws", () => {
      const followingPlugin = {
        getName: () => "following",
        getDefinition: () => ({
          create: vi.fn(() => ({})),
        }),
        getDefaultOptions: () => () => ({}),
      };

      const badPlugin = {
        getName: () => "bad",
        getDefinition: () => ({
          create: () => {
            throw new Error("boom");
          },
        }),
        getDefaultOptions: () => () => ({}),
      };

      const ctx = createMockCtx({
        preset: {
          manifest: [
            {
              module: badPlugin,
              enabled: true,
            },
            {
              module: followingPlugin,
              enabled: true,
            },
          ],
          defaults: {
            bad: () => ({}),
            following: () => ({}),
          },
        },
      });

      expect(() =>
        createPlugins(
          {
            bad: {},
            following: {},
          },
          ctx,
        ),
      ).toThrow("boom");

      expect(followingPlugin.getDefinition().create).not.toHaveBeenCalled();
    });
  });
});
