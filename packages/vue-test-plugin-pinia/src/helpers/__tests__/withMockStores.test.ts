import { describe, expect, it, vi } from "vitest";

import { MOCK_STORES } from "../../constants/constants.js";
import { withMockStores } from "../withMockStores.js";

describe("withMockStores", () => {
  it("should return an object containing the callback under the internal symbol", () => {
    const callback = vi.fn();

    const result = withMockStores(callback);

    expect(result[MOCK_STORES]).toBe(callback);
  });

  it("should expose only the internal symbol as an own property", () => {
    const callback = vi.fn();

    const result = withMockStores(callback);

    expect(Reflect.ownKeys(result)).toEqual([MOCK_STORES]);
  });

  it("should define the callback as an enumerable property", () => {
    const callback = vi.fn();

    const result = withMockStores(callback);

    const descriptor = Object.getOwnPropertyDescriptor(result, MOCK_STORES);

    expect(descriptor).toEqual({
      value: callback,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  });

  it("should preserve the callback when spread into plugin options", () => {
    const callback = vi.fn();

    const result = {
      stubActions: false,
      ...withMockStores(callback),
    };

    expect(result.stubActions).toBe(false);
    expect(result[MOCK_STORES]).toBe(callback);
    expect(Reflect.ownKeys(result)).toEqual(["stubActions", MOCK_STORES]);
  });

  it("should not invoke the callback", () => {
    const callback = vi.fn();

    withMockStores(callback);

    expect(callback).not.toHaveBeenCalled();
  });

  it("should create independent configuration objects for separate calls", () => {
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();

    const firstResult = withMockStores(firstCallback);
    const secondResult = withMockStores(secondCallback);

    expect(firstResult).not.toBe(secondResult);

    expect(firstResult[MOCK_STORES]).toBe(firstCallback);
    expect(secondResult[MOCK_STORES]).toBe(secondCallback);
  });
});
