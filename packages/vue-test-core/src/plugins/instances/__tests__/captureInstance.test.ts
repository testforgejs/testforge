import { describe, it, expect } from "vitest";

import { captureInstance } from "../captureInstance.js";
import { PLUGIN_EXPOSE } from "../../../constants/constants.js";

describe("captureInstance", () => {
  it("should return undefined instance before capture callback is called", () => {
    const capture = captureInstance();

    expect(capture.instance).toBeUndefined();
  });

  it("should store instance passed to the internal capture callback", () => {
    const capture = captureInstance();
    const mockInstance = { id: 1 };

    capture[PLUGIN_EXPOSE](mockInstance);

    expect(capture.instance).toBe(mockInstance);
  });

  it("should overwrite instance if capture callback is called multiple times", () => {
    const capture = captureInstance();
    const first = { id: 1 };
    const second = { id: 2 };

    capture[PLUGIN_EXPOSE](first);
    capture[PLUGIN_EXPOSE](second);

    expect(capture.instance).toBe(second);
  });

  it("should keep captures isolated between different calls", () => {
    const capA = captureInstance();
    const capB = captureInstance();

    const a = { a: true };
    const b = { b: true };

    capA[PLUGIN_EXPOSE](a);
    capB[PLUGIN_EXPOSE](b);

    expect(capA.instance).toBe(a);
    expect(capB.instance).toBe(b);
  });

  it("should allow capturing undefined explicitly", () => {
    const capture = captureInstance<undefined>();

    capture[PLUGIN_EXPOSE](undefined);

    expect(capture.instance).toBeUndefined();
  });

  it("should spread only the internal capture callback", () => {
    const capture = captureInstance();

    const options = { ...capture };

    expect(Reflect.ownKeys(options)).toEqual([PLUGIN_EXPOSE]);

    expect(options[PLUGIN_EXPOSE]).toBe(capture[PLUGIN_EXPOSE]);

    expect(options).not.toHaveProperty("expose");
    expect(options).not.toHaveProperty("instance");
  });

  it("should expose instance through a non-enumerable getter", () => {
    const capture = captureInstance();
    const instance = { id: 1 };

    const descriptor = Object.getOwnPropertyDescriptor(capture, "instance");

    expect(descriptor).toBeDefined();
    expect(descriptor?.enumerable).toBe(false);
    expect(descriptor?.get).toBeTypeOf("function");
    expect(descriptor?.set).toBeUndefined();

    capture[PLUGIN_EXPOSE](instance);

    expect(capture.instance).toBe(instance);
  });
});
