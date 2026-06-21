import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@vue/test-utils", () => ({
  mount: vi.fn(() => "mount-result"),
  shallowMount: vi.fn(() => "shallow-result"),
}));

vi.mock("../../pluginsRegistry/createPlugins.js", () => ({
  createPlugins: vi.fn(() => ["managed-plugin"]),
}));

import { mount, shallowMount } from "@vue/test-utils";
import { createPlugins } from "../../pluginsRegistry/createPlugins.js";
import { mountWithPlugins } from "../mountWithPlugins.js";

import type { MountReadyContext } from "../../types";

const mockMount = vi.mocked(mount);

describe("mountWithPlugins", () => {
  const component = { name: "TestComponent" };

  const baseCtx = {
    defaultMountOptions: {},
    mountOptions: {},
    extraOptions: {},
    supportedPlugins: {},
    preset: undefined,
    result: {
      mountOptions: {
        props: { a: 1 },
        global: { config: "base" },
      },
      plugins: { test: true },
      global: { mixins: ["base-mixin"] },
    },
  } as unknown as MountReadyContext;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  describe("mount strategy selection", () => {
    it("should use default runtime options when runtimeOptions are omitted", () => {
      const result = mountWithPlugins(component, baseCtx);

      expect(mount).toHaveBeenCalledTimes(1);
      expect(result).toBe("mount-result");
      expect(shallowMount).not.toHaveBeenCalled();
    });

    it("should use shallowMount when shallowByDefault is true", () => {
      const result = mountWithPlugins(
        component,
        baseCtx,
        {},
        {
          shallowByDefault: true,
        },
      );

      expect(shallowMount).toHaveBeenCalledTimes(1);
      expect(result).toBe("shallow-result");
      expect(mount).not.toHaveBeenCalled();
    });

    it("should use shallowMount when shallow is true", () => {
      const result = mountWithPlugins(component, baseCtx, {
        shallow: true,
      });

      expect(shallowMount).toHaveBeenCalledTimes(1);
      expect(result).toBe("shallow-result");
      expect(mount).not.toHaveBeenCalled();
    });

    it("should prioritize shallow option over shallowByDefault", () => {
      const result = mountWithPlugins(
        component,
        baseCtx,
        {
          shallow: false,
        },
        {
          shallowByDefault: true,
        },
      );

      expect(mount).toHaveBeenCalledTimes(1);
      expect(result).toBe("mount-result");
      expect(shallowMount).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  describe("managed plugins integration", () => {
    it("should call createPlugins when skipManagedPlugins is false", () => {
      mountWithPlugins(component, baseCtx);

      expect(createPlugins).toHaveBeenCalledWith(baseCtx.result.plugins, baseCtx);
    });

    it("should not call createPlugins when skipManagedPlugins is true", () => {
      mountWithPlugins(component, baseCtx, {
        skipManagedPlugins: true,
      });

      expect(createPlugins).not.toHaveBeenCalled();
    });

    it("should merge managed plugins into global.plugins", () => {
      mountWithPlugins(component, baseCtx);

      const callArgs = mockMount.mock.calls[0][1];

      expect(callArgs).toBeDefined();
      expect(callArgs!.global!.plugins).toEqual(["managed-plugin"]);
    });

    it("should preserve existing global.plugins and append managed ones", () => {
      const mockPlugin = () => {};

      mountWithPlugins(component, baseCtx, {
        global: { plugins: [mockPlugin] },
      });

      const callArgs = mockMount.mock.calls[0][1];

      expect(callArgs).toBeDefined();
      expect(callArgs!.global!.plugins).toEqual([mockPlugin, "managed-plugin"]);
    });
  });

  // ─────────────────────────────────────────────
  describe("options and overrides merging", () => {
    it("should pass overrides over mountOptions", () => {
      mountWithPlugins(component, baseCtx, {
        props: { a: 999 },
      });

      const callArgs = mockMount.mock.calls[0][1];

      expect(callArgs).toBeDefined();
      expect(callArgs!.props).toEqual({ a: 999 });
    });

    it("should pass global from ctx when overrides do not provide one", () => {
      mountWithPlugins(component, baseCtx);

      const callArgs = mockMount.mock.calls[0][1];

      expect(callArgs).toBeDefined();
      expect(callArgs!.global!.mixins).toEqual(["base-mixin"]);
    });
  });

  // ─────────────────────────────────────────────
  describe("immutability guarantees", () => {
    it("should not mutate ctx.result.global object", () => {
      const mockPlugin = () => {};
      const originalGlobal = { plugins: [mockPlugin] };

      const ctx = {
        defaultMountOptions: {},
        mountOptions: {},
        extraOptions: {},
        supportedPlugins: {},
        preset: undefined,
        result: {
          mountOptions: {},
          plugins: {},
          pluginDefaultsState: {},
          global: originalGlobal,
        },
      } as unknown as MountReadyContext;

      mountWithPlugins(component, ctx, {});

      expect(ctx.result.global).toEqual({ plugins: [mockPlugin] });
    });
  });
});
