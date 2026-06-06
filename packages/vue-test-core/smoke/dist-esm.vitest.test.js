import { describe, it, expect } from "vitest";
import { EXPECTED_EXPORTS } from "./constants.js";

import * as pkg from "../dist/index.js";

describe("dist ESM smoke", () => {
  it("should load package", () => {
    expect(pkg).toBeDefined();
  });

  it("should expose expected public API", () => {
    expect(Object.keys(pkg).sort()).toEqual(EXPECTED_EXPORTS);
  });
});
