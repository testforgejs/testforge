import { describe, it, expect, vi, beforeEach } from "vitest";
import { patchPluginState } from "../patchPluginState.js";
import * as stateModule from "../../../state/patchResultState.js";

describe("patchPluginState", () => {
  let ctx;

  beforeEach(() => {
    vi.restoreAllMocks();

    ctx = {
      result: {
        plugins: {
          pinia: { existing: true },
          i18n: { locale: "en" },
        },
      },
    };
  });

  it("should call patchResultState with correctly merged plugin config", () => {
    const spy = vi
      .spyOn(stateModule, "patchResultState")
      .mockImplementation((ctx) => ctx);

    patchPluginState(ctx, "pinia", { newOption: 123 });

    expect(spy).toHaveBeenCalledWith(ctx, {
      plugins: {
        pinia: {
          existing: true,
          newOption: 123,
        },
      },
    });
  });

  it("should create plugin entry if it does not exist", () => {
    const localCtx = {
      result: { plugins: {} },
    };

    const spy = vi
      .spyOn(stateModule, "patchResultState")
      .mockImplementation((ctx) => ctx);

    patchPluginState(localCtx, "router", { history: true });

    expect(spy).toHaveBeenCalledWith(localCtx, {
      plugins: {
        router: { history: true },
      },
    });
  });

  it("should give priority to config over existing plugin state", () => {
    const spy = vi
      .spyOn(stateModule, "patchResultState")
      .mockImplementation((ctx) => ctx);

    patchPluginState(ctx, "i18n", { locale: "fr" });

    expect(spy).toHaveBeenCalledWith(ctx, {
      plugins: {
        i18n: { locale: "fr" },
      },
    });
  });

  it("should not affect other plugins", () => {
    const spy = vi
      .spyOn(stateModule, "patchResultState")
      .mockImplementation((ctx) => ctx);

    patchPluginState(ctx, "pinia", { a: 1 });

    const patchArg = spy.mock.calls[0][1];

    expect(patchArg.plugins).not.toHaveProperty("i18n");
  });

  it("should return the same context reference", () => {
    vi.spyOn(stateModule, "patchResultState").mockImplementation((ctx) => ctx);

    const result = patchPluginState(ctx, "pinia", {});

    expect(result).toBe(ctx);
  });
});
