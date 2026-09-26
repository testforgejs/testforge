import { describe, it, expect, vi } from "vitest";
import { defineStore, setActivePinia } from "pinia";
import type { Pinia } from "pinia";

import { piniaPlugin } from "../piniaPlugin.js";
import { createPiniaPlugin } from "../createPiniaPlugin.js";

vi.mock("pinia", async (importOriginal) => {
  const actual = await importOriginal<typeof import("pinia")>();

  return {
    ...actual,
    setActivePinia: vi.fn(),
  };
});

describe("piniaPlugin", () => {
  it("should return 'pinia' as plugin name when getName is called", () => {
    expect(piniaPlugin.getName()).toBe("pinia");
  });

  it("should return definition containing createPiniaPlugin when getDefinition is called", () => {
    const definition = piniaPlugin.getDefinition();

    expect(definition.create).toBe(createPiniaPlugin);
  });

  it("should provide default Pinia options without a test runner", () => {
    const optionsFactory = piniaPlugin.getDefaultOptions();
    const options = optionsFactory();

    expect(options).toEqual({});
  });

  it("should use the test runner mock function as createSpy", () => {
    const optionsFactory = piniaPlugin.getDefaultOptions(vi);
    const options = optionsFactory();

    expect(options).toEqual({ createSpy: vi.fn });
  });

  it("should create Pinia testing instance with actions stubbed by default", () => {
    const useCounterStore = defineStore("counter", {
      state: () => ({
        count: 0,
      }),

      actions: {
        increment() {
          this.count++;
        },
      },
    });

    const options = piniaPlugin.getDefaultOptions(vi)();

    const definition = piniaPlugin.getDefinition();
    const pinia = definition.create(options);

    const store = useCounterStore(pinia);

    store.increment();

    expect(store.count).toBe(0);
    expect(store.increment).toHaveBeenCalledOnce();
  });

  it("should execute actions when stubActions is disabled", () => {
    const useCounterStore = defineStore("counter", {
      state: () => ({
        count: 0,
      }),

      actions: {
        increment() {
          this.count++;
        },
      },
    });

    const options = {
      ...piniaPlugin.getDefaultOptions(vi)(),
      stubActions: false,
    };

    const definition = piniaPlugin.getDefinition();
    const pinia = definition.create(options);

    const store = useCounterStore(pinia);

    store.increment();

    expect(store.count).toBe(1);
    expect(store.increment).toHaveBeenCalledOnce();
  });

  it("should call setActivePinia with created instance in afterCreate hook", () => {
    const pinia = {} as Pinia;
    const definition = piniaPlugin.getDefinition();

    definition.afterCreate?.(pinia, {} as any);

    expect(setActivePinia).toHaveBeenCalledTimes(1);
    expect(setActivePinia).toHaveBeenCalledWith(pinia);
  });
});
