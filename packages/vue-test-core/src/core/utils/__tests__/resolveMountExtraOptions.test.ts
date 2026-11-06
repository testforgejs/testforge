import { describe, expect, it } from "vitest";

import { resolveMountExtraOptions } from "../resolveMountExtraOptions.js";

describe("resolveMountExtraOptions", () => {
  it("preserves options when no preset is selected", () => {
    const extraOptions = { skipDefaultProps: true };

    const result = resolveMountExtraOptions(extraOptions);

    expect(result).toBe(extraOptions);
  });

  it("inherits the factory preset when no mount preset is selected", () => {
    const extraOptions = { skipDefaultProps: true };

    const result = resolveMountExtraOptions(extraOptions, "admin");

    expect(result).toEqual({
      skipDefaultProps: true,
      presetKey: "admin",
    });

    expect(extraOptions).toEqual({ skipDefaultProps: true });
  });

  it("prioritizes the mount preset over the factory preset", () => {
    const result = resolveMountExtraOptions({ presetKey: "i18nOnly" }, "admin");

    expect(result.presetKey).toBe("i18nOnly");
  });

  it("preserves an explicit default selection", () => {
    const result = resolveMountExtraOptions({ presetKey: "default" }, "admin");

    expect(result.presetKey).toBe("default");
  });

  it("preserves an empty mount selection without falling back to the factory preset", () => {
    const result = resolveMountExtraOptions({ presetKey: " " }, "admin");

    expect(result.presetKey).toBe(" ");
  });
});
