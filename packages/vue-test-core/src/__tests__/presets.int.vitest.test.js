/** @vitest-environment jsdom */
import { vi } from "vitest";
import { createTestFramework } from "../core/createTestFramework.js";
import { presets } from "../../../vue-test-preset-recommended/src/presets.js";

const MockComponent = {
  name: "MockComponent",
  render: () => null,
};

describe("recommended preset", () => {
  const testComponentFactory = createTestFramework({
    presets,
  }).testComponentFactory;

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should work when Vitest globals are unavailable", () => {
    vi.stubGlobal("vi", undefined);

    const factory = testComponentFactory(MockComponent);

    expect(() => factory()).not.toThrow();
  });
});
