import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockCtx } from "../../../__tests__/fixtures.js";

vi.mock("../../../state/patchResultState.js", () => ({
  patchResultState: vi.fn(),
}));

import { patchResultState } from "../../../state/patchResultState.js";
import { withBaseMountOptions } from "../withBaseMountOptions.js";

import type { ComponentFactoryOptions, RuntimeContext } from "../../../../types";

const mockPatchResultState = vi.mocked(patchResultState);

describe("withBaseMountOptions middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPatchResultState.mockImplementation((ctx) => ctx);
  });

  const defaultMountOptions = {
    global: { plugins: ["mock-global-plugin"] as any },
    plugins: { b: "mock-plugin-b" as any },
    shallow: false,
    attachTo: "#app",
  } as ComponentFactoryOptions;

  const mountOptions = {
    global: { plugins: [] },
    plugins: { d: "another-mock-plugin" as any },
    shallow: true,
    attrs: { id: "test" },
  } as ComponentFactoryOptions;

  it("should merge only flat fields from defaults and overrides", () => {
    const ctx = createMockCtx<RuntimeContext>({
      defaultMountOptions,
      mountOptions,
      extraOptions: { skipDefaultOptions: false },
    });

    const result = withBaseMountOptions(ctx);

    expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
      mountOptions: {
        shallow: true,
        attachTo: "#app",
      },
    });

    expect(result).toBe(ctx);
  });

  it("should exclude attrs from mountOptions processing", () => {
    const ctx = createMockCtx<RuntimeContext>({
      defaultMountOptions: {
        attrs: { role: "button" },
      },
      mountOptions: {
        attrs: { id: "submit" },
      },
      extraOptions: { skipDefaultOptions: false },
    });
    withBaseMountOptions(ctx);

    expect(patchResultState).toHaveBeenCalledWith(ctx, {
      mountOptions: {},
    });
  });

  it("should ignore default flat mount options when skipDefaultOptions is true", () => {
    const ctx = createMockCtx<RuntimeContext>({
      defaultMountOptions,
      mountOptions,
      extraOptions: { skipDefaultOptions: true },
    });

    withBaseMountOptions(ctx);

    expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
      mountOptions: {
        shallow: true,
      },
    });
  });

  // ==========================================
  // Data cleaning (sanitization) strategy
  // ==========================================
  describe("Sanitization Strategy", () => {
    it("should extract and exclude pipeline-managed layers from the final mountOptions", () => {
      const ctx = createMockCtx<RuntimeContext>({
        defaultMountOptions: {
          global: { plugins: ["def-plugin"] as any },
          plugins: { def: "plugin" as any },
          attrs: { role: "button" },
        } as ComponentFactoryOptions,
        mountOptions: {
          global: { plugins: ["override-plugin"] as any },
          plugins: { override: "plugin" as any },
          attrs: { id: "test" },
          shallow: true, // Payload that must remain
        } as ComponentFactoryOptions,
        extraOptions: { skipDefaultOptions: false },
      });

      withBaseMountOptions(ctx);
      const [, payload] = mockPatchResultState.mock.calls[0];
      const rawMountOptions = payload.mountOptions as Record<string, unknown>;

      // Check that the runtime code has removed absolutely everything unnecessary
      expect(rawMountOptions.global).toBeUndefined();
      expect(rawMountOptions.plugins).toBeUndefined();
      expect(rawMountOptions.attrs).toBeUndefined();

      // Check that the payload has not been affected
      expect(rawMountOptions.shallow).toBe(true);
    });

    it("should exclude component-level fields (props/slots) handled outside the pipeline", () => {
      const ctx = createMockCtx<RuntimeContext>({
        defaultMountOptions: {
          props: { defaultProp: true },
          slots: { defaultSlot: "slot" },
        },
        mountOptions: {
          props: { overrideProp: true },
          slots: { overrideSlot: "slot" },
          attachTo: "#app", // Payload
        },
        extraOptions: { skipDefaultOptions: false },
      });

      withBaseMountOptions(ctx);
      const [, payload] = mockPatchResultState.mock.calls[0];
      const rawMountOptions = payload.mountOptions as Record<string, unknown>;

      // Check the cut-off for props and slots, since they have an external merger strategy
      expect(rawMountOptions.props).toBeUndefined();
      expect(rawMountOptions.slots).toBeUndefined();

      // Payload is present
      expect(rawMountOptions.attachTo).toBe("#app");
    });
  });

  it("should not mutate source mount option objects", () => {
    const defaultsCopy = structuredClone(defaultMountOptions);
    const overridesCopy = structuredClone(mountOptions);

    const ctx = createMockCtx<RuntimeContext>({
      defaultMountOptions,
      mountOptions,
      extraOptions: { skipDefaultOptions: false },
    });

    withBaseMountOptions(ctx);

    expect(defaultMountOptions).toEqual(defaultsCopy);
    expect(mountOptions).toEqual(overridesCopy);
  });
});
