import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPluginsMiddlewares } from "../createPluginsMiddlewares.js";
import { createPluginMiddleware } from "../../adapters/createPluginMiddleware.js";

vi.mock("../../../plugins/adapters/createPluginMiddleware.js");

const mockCreatePluginMiddleware = vi.mocked(createPluginMiddleware);

describe("createPluginsMiddlewares", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when no supported plugins provided", () => {
    const result = createPluginsMiddlewares({});

    expect(result).toEqual([]);
    expect(createPluginMiddleware).not.toHaveBeenCalled();
  });

  it("creates middleware for each supported plugin", () => {
    const mw1 = Object.assign(() => {}, { id: "mw1" }) as any;
    const mw2 = Object.assign(() => {}, { id: "mw2" }) as any;
    const mw3 = Object.assign(() => {}, { id: "mw3" }) as any;

    mockCreatePluginMiddleware
      .mockReturnValueOnce(mw1)
      .mockReturnValueOnce(mw2)
      .mockReturnValueOnce(mw3);

    const supportedPlugins = {
      pinia: true,
      i18n: true,
      router: true,
    };

    const result = createPluginsMiddlewares(supportedPlugins);

    expect(mockCreatePluginMiddleware).toHaveBeenCalledTimes(3);
    expect(mockCreatePluginMiddleware).toHaveBeenNthCalledWith(1, "pinia");
    expect(mockCreatePluginMiddleware).toHaveBeenNthCalledWith(2, "i18n");
    expect(mockCreatePluginMiddleware).toHaveBeenNthCalledWith(3, "router");

    expect(result).toEqual([mw1, mw2, mw3]);
  });

  it("preserves the order of Object.keys iteration", () => {
    const first = Object.assign(() => {}, { id: "first" }) as any;
    const second = Object.assign(() => {}, { id: "second" }) as any;
    mockCreatePluginMiddleware.mockReturnValueOnce(first).mockReturnValueOnce(second);

    const supportedPlugins = {
      a: true,
      b: true,
    };

    const result = createPluginsMiddlewares(supportedPlugins);

    expect(result).toEqual([first, second]);
  });
});
