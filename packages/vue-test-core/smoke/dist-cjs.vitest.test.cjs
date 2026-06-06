import { describe, it, expect } from "vitest";
import { EXPECTED_EXPORTS } from "./constants.js";

// Testing CommonJS entrypoint intentionally.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("../dist/index.cjs");

describe("dist CJS smoke", () => {
  it("should load package", () => {
    expect(pkg).toBeDefined();
  });

  it("should expose expected public API", () => {
    expect(Object.keys(pkg).sort()).toEqual(EXPECTED_EXPORTS);
  });
});
