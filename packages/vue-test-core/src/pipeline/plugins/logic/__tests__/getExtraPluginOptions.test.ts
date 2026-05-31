import { describe, expect, it } from "vitest";

import type { RuntimeExtraOptions } from "../../../../types";

import { getExtraPluginOptions } from "../getExtraPluginOptions";

describe("getExtraPluginOptions", () => {
  it("should return plugin configuration object", () => {
    const extraOptions = {
      plugins: {
        pinia: {
          stubActions: true,
        },
      },
    };

    expect(getExtraPluginOptions(extraOptions, "pinia")).toEqual({
      stubActions: true,
    });
  });

  it("should return false when plugin is explicitly disabled", () => {
    const extraOptions = {
      plugins: {
        pinia: false,
      },
    } satisfies RuntimeExtraOptions;

    expect(getExtraPluginOptions(extraOptions, "pinia")).toBe(false);
  });

  it("should return undefined when plugin override does not exist", () => {
    const extraOptions = {
      plugins: {},
    };

    expect(getExtraPluginOptions(extraOptions, "pinia")).toBeUndefined();
  });

  it("should return undefined when plugins section is missing", () => {
    const extraOptions = {};

    expect(getExtraPluginOptions(extraOptions, "pinia")).toBeUndefined();
  });
});
