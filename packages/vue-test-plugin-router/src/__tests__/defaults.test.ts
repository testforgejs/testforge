import { describe, expect, it } from "vitest";

import { defaultOptions } from "../defaults.js";

describe("defaultOptions", () => {
  it("should create default router options with memory history and empty routes", () => {
    const createOptions = defaultOptions();

    const options = createOptions();

    expect(options.history).toBeDefined();
    expect(options.history.createHref("/test")).toBe("/test");
    expect(options.routes).toEqual([]);
  });

  it("should create a fresh options object on each invocation", () => {
    const createOptions = defaultOptions();

    const first = createOptions();
    const second = createOptions();

    expect(first).not.toBe(second);
  });

  it("should create independent history and routes instances on each invocation", () => {
    const createOptions = defaultOptions();

    const first = createOptions();
    const second = createOptions();

    expect(first.history).not.toBe(second.history);
    expect(first.routes).not.toBe(second.routes);
  });
});
