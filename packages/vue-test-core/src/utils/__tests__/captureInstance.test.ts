import { describe, it, expect } from "vitest";
import { captureInstance } from "../captureInstance.js";

describe("captureInstance", () => {
  it("should return undefined instance before expose is called", () => {
    const capture = captureInstance();

    expect(capture.instance).toBeUndefined();
  });

  it("should store instance passed to expose", () => {
    const capture = captureInstance();
    const mockInstance = { id: 1 };

    capture.expose(mockInstance);

    expect(capture.instance).toBe(mockInstance);
  });

  it("should overwrite instance if expose is called multiple times", () => {
    const capture = captureInstance();
    const first = { id: 1 };
    const second = { id: 2 };

    capture.expose(first);
    capture.expose(second);

    expect(capture.instance).toBe(second);
  });

  it("should keep captures isolated between different calls", () => {
    const capA = captureInstance();
    const capB = captureInstance();

    const a = { a: true };
    const b = { b: true };

    capA.expose(a);
    capB.expose(b);

    expect(capA.instance).toBe(a);
    expect(capB.instance).toBe(b);
  });

  it("should allow exposing undefined explicitly", () => {
    const capture = captureInstance();

    capture.expose(undefined);

    expect(capture.instance).toBeUndefined();
  });
});
