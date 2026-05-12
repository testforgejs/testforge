import { patchResultState } from "../patchResultState.js";

const createCtx = () => ({
  result: {
    mountOptions: { a: 1 },
    plugins: { p1: true },
    pluginPresets: { presetA: true },
    global: { g: 1 },
  },
});

describe("patchResultState", () => {
  test("should return the same ctx reference", () => {
    const ctx = createCtx();
    const returned = patchResultState(ctx, {});

    expect(returned).toBe(ctx);
  });

  test("should not overwrite existing data when patch is empty", () => {
    const ctx = createCtx();
    const snapshot = JSON.parse(JSON.stringify(ctx.result));

    patchResultState(ctx, {});

    expect(ctx.result).toEqual(snapshot);
  });

  test("should merge mountOptions correctly", () => {
    const ctx = createCtx();

    patchResultState(ctx, {
      mountOptions: { b: 2 },
    });

    expect(ctx.result.mountOptions).toEqual({ a: 1, b: 2 });
  });

  test("should merge plugins correctly", () => {
    const ctx = createCtx();

    patchResultState(ctx, {
      plugins: { p2: false },
    });

    expect(ctx.result.plugins).toEqual({ p1: true, p2: false });
  });

  test("should merge pluginPresets correctly", () => {
    const ctx = createCtx();

    patchResultState(ctx, {
      pluginPresets: { presetB: false },
    });

    expect(ctx.result.pluginPresets).toEqual({
      presetA: true,
      presetB: false,
    });
  });

  test("should merge global correctly", () => {
    const ctx = createCtx();

    patchResultState(ctx, {
      global: { g2: 2 },
    });

    expect(ctx.result.global).toEqual({ g: 1, g2: 2 });
  });

  test("should not affect other sections when patching one section", () => {
    const ctx = createCtx();

    patchResultState(ctx, {
      plugins: { p2: true },
    });

    expect(ctx.result.mountOptions).toEqual({ a: 1 });
    expect(ctx.result.pluginPresets).toEqual({ presetA: true });
    expect(ctx.result.global).toEqual({ g: 1 });
  });

  test("should ignore unknown fields in patch", () => {
    const ctx = createCtx();

    patchResultState(ctx, {
      unknown: { x: 1 },
    });

    expect(ctx.result).toEqual({
      mountOptions: { a: 1 },
      plugins: { p1: true },
      pluginPresets: { presetA: true },
      global: { g: 1 },
    });
  });

  test("should not mutate the patch object", () => {
    const ctx = createCtx();
    const patch = {
      plugins: { p2: true },
    };

    const snapshot = JSON.parse(JSON.stringify(patch));

    patchResultState(ctx, patch);

    expect(patch).toEqual(snapshot);
  });

  test("should preserve already initialized result sections", () => {
    const ctx = createCtx();

    patchResultState(ctx, {
      plugins: {},
    });

    expect(ctx.result.mountOptions).toBeDefined();
    expect(ctx.result.plugins).toBeDefined();
    expect(ctx.result.pluginPresets).toBeDefined();
    expect(ctx.result.global).toBeDefined();
  });
});
