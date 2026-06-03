import { describe, it, expect } from "vitest";
import { withAttrs } from "../withAttrs.js";

describe("withAttrs", () => {
  it("should use attrs from mountOptions when defaultMountOptions.attrs are not provided", () => {
    const ctx = {
      defaultMountOptions: {},
      mountOptions: {
        attrs: {
          id: "submit",
        },
      },
      extraOptions: {},
      result: {
        mountOptions: {},
      },
    };

    const result = withAttrs(ctx);

    expect(result.result.mountOptions.attrs).toEqual({
      id: "submit",
    });
  });

  it("should use attrs from defaultMountOptions when mountOptions.attrs are not provided", () => {
    const ctx = {
      defaultMountOptions: {
        attrs: {
          role: "button",
        },
      },
      mountOptions: {},
      extraOptions: {},
      result: {
        mountOptions: {},
      },
    };

    const result = withAttrs(ctx);

    expect(result.result.mountOptions.attrs).toEqual({
      role: "button",
    });
  });

  it("should shallow-merge attrs from defaultMountOptions and mountOptions", () => {
    const ctx = {
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
      extraOptions: {},
      result: {
        mountOptions: {},
      },
    };

    const result = withAttrs(ctx);

    expect(result.result.mountOptions.attrs).toEqual({
      role: "button",
      id: "submit",
    });
  });

  it("should prioritize mountOptions.attrs when keys conflict", () => {
    const ctx = {
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
      extraOptions: {},
      result: {
        mountOptions: {},
      },
    };

    const result = withAttrs(ctx);

    expect(result.result.mountOptions.attrs).toEqual({
      role: "link",
    });
  });

  it("should ignore defaultMountOptions.attrs when skipDefaultOptions is true", () => {
    const ctx = {
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
      result: {
        mountOptions: {},
      },
    };

    const result = withAttrs(ctx);

    expect(result.result.mountOptions.attrs).toEqual({
      id: "submit",
    });
  });
});
