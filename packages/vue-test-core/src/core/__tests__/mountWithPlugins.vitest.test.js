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

describe("mountWithPlugins", () => {
  const component = { name: "TestComponent" };

  const baseCtx = {
    result: {
      mountOptions: {
        props: { a: 1 },
        global: { config: "base" },
      },
      plugins: { test: true },
      global: { mixins: ["base-mixin"] },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  describe("mount strategy selection", () => {
    it("should use shallowMount by default", () => {
      mountWithPlugins(component, baseCtx);

      expect(shallowMount).toHaveBeenCalled();
      expect(mount).not.toHaveBeenCalled();
    });

    it("should use mount when useShallow = false", () => {
      mountWithPlugins(component, baseCtx, { useShallow: false });

      expect(mount).toHaveBeenCalled();
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

      const callArgs = shallowMount.mock.calls[0][1];

      expect(callArgs.global.plugins).toEqual(["managed-plugin"]);
    });

    it("should preserve existing global.plugins and append managed ones", () => {
      mountWithPlugins(component, baseCtx, {
        global: { plugins: ["existing"] },
      });

      const callArgs = shallowMount.mock.calls[0][1];

      expect(callArgs.global.plugins).toEqual(["existing", "managed-plugin"]);
    });
  });

  // ─────────────────────────────────────────────
  describe("options and overrides merging", () => {
    it("should pass overrides over mountOptions", () => {
      mountWithPlugins(component, baseCtx, {
        props: { a: 999 },
      });

      const callArgs = shallowMount.mock.calls[0][1];

      expect(callArgs.props).toEqual({ a: 999 });
    });

    it("should pass global from ctx when overrides do not provide one", () => {
      mountWithPlugins(component, baseCtx);

      const callArgs = shallowMount.mock.calls[0][1];

      expect(callArgs.global.mixins).toEqual(["base-mixin"]);
    });
  });

  // ─────────────────────────────────────────────
  describe("immutability guarantees", () => {
    it("should not mutate ctx.result.global object", () => {
      const originalGlobal = { plugins: ["from-ctx"] };

      const ctx = {
        result: {
          mountOptions: {},
          plugins: {},
          global: originalGlobal,
        },
      };

      mountWithPlugins(component, ctx, {});

      expect(ctx.result.global).toEqual({ plugins: ["from-ctx"] });
    });
  });
});
