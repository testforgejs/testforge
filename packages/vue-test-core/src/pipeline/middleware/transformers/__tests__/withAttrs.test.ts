import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../state/patchResultState.js", () => ({
  patchResultState: vi.fn(),
}));

import { patchResultState } from "../../../state/patchResultState.js";
import { withAttrs } from "../withAttrs.js";
import { createMockCtx } from "../../../__tests__/fixtures.js";

import type { RuntimeContext } from "../../../../types";

const mockPatchResultState = vi.mocked(patchResultState);

describe("withAttrs", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPatchResultState.mockImplementation((ctx) => ctx);
  });

  it("should use attrs from mountOptions when defaultMountOptions.attrs are not provided", () => {
    const ctx = createMockCtx<RuntimeContext>({
      mountOptions: {
        attrs: {
          id: "submit",
        },
      },
    });

    const result = withAttrs(ctx);

    expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
      mountOptions: { attrs: { id: "submit" } },
    });
    expect(result).toBe(ctx);
  });

  it("should use attrs from defaultMountOptions when mountOptions.attrs are not provided", () => {
    const ctx = createMockCtx<RuntimeContext>({
      defaultMountOptions: {
        attrs: {
          role: "button",
        },
      },
    });

    withAttrs(ctx);

    expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
      mountOptions: { attrs: { role: "button" } },
    });
  });

  it("should shallow-merge attrs from defaultMountOptions and mountOptions", () => {
    const ctx = createMockCtx<RuntimeContext>({
      defaultMountOptions: {
        attrs: {
          role: "button",
        },
      },
      mountOptions: {
        attrs: {
          id: "submit",
        },
      },
    });

    withAttrs(ctx);

    expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
      mountOptions: {
        attrs: { role: "button", id: "submit" },
      },
    });
  });

  it("should prioritize mountOptions.attrs when keys conflict", () => {
    const ctx = createMockCtx<RuntimeContext>({
      defaultMountOptions: {
        attrs: {
          role: "button",
        },
      },
      mountOptions: {
        attrs: {
          role: "link",
        },
      },
    });

    withAttrs(ctx);

    expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
      mountOptions: { attrs: { role: "link" } },
    });
  });

  it("should ignore defaultMountOptions.attrs when skipDefaultOptions is true", () => {
    const ctx = createMockCtx<RuntimeContext>({
      defaultMountOptions: {
        attrs: {
          role: "button",
        },
      },
      mountOptions: {
        attrs: {
          id: "submit",
        },
      },
      extraOptions: {
        skipDefaultOptions: true,
      },
    });

    withAttrs(ctx);

    expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
      mountOptions: { attrs: { id: "submit" } },
    });
  });

  it("should pass an empty object to patchResultState when no attrs are present", () => {
    const ctx = createMockCtx<RuntimeContext>({
      defaultMountOptions: {},
      mountOptions: {},
    });
    mockPatchResultState.mockReturnValue(ctx);

    withAttrs(ctx);

    expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
      mountOptions: {},
    });
  });
});
