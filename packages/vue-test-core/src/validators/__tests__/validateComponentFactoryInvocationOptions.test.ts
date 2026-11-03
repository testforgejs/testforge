import { describe, expect, it } from "vitest";

import { validateComponentFactoryInvocationOptions } from "../validateComponentFactoryInvocationOptions.js";

describe("validateComponentFactoryInvocationOptions", () => {
  it("accepts an empty options object", () => {
    expect(() => validateComponentFactoryInvocationOptions({})).not.toThrow();
  });

  it.each(["props", "mountOptions", "slots", "extraOptions"])(
    'accepts the positional argument key "%s" on its own',
    (key) => {
      expect(() => validateComponentFactoryInvocationOptions({ [key]: {} })).not.toThrow();
    },
  );

  it("accepts all four supported keys together", () => {
    expect(() =>
      validateComponentFactoryInvocationOptions({
        props: { title: "Hello" },
        mountOptions: { shallow: true },
        slots: { default: "Content" },
        extraOptions: { presetKey: "i18n" },
      }),
    ).not.toThrow();
  });

  it("accepts explicitly undefined optional fields", () => {
    expect(() =>
      validateComponentFactoryInvocationOptions({
        props: undefined,
        mountOptions: undefined,
        slots: undefined,
        extraOptions: undefined,
      }),
    ).not.toThrow();
  });

  it.each([undefined, null, false, 42, "options", [], () => ({}), new Date()])(
    "rejects a non-plain options value: %s",
    (value) => {
      expect(() => validateComponentFactoryInvocationOptions(value)).toThrow(
        '"options" must be a plain object.',
      );
    },
  );

  it.each(["presetKey", "component", "defaultProps", "extraOption"])(
    'rejects the unknown top-level key "%s"',
    (key) => {
      expect(() => validateComponentFactoryInvocationOptions({ [key]: {} })).toThrow(
        `Unknown option "${key}" in "options".`,
      );
    },
  );

  it("rejects unexpected symbol keys", () => {
    const unexpectedKey = Symbol("unexpected");

    expect(() => validateComponentFactoryInvocationOptions({ [unexpectedKey]: true })).toThrow(
      'Unknown option "Symbol(unexpected)" in "options".',
    );
  });

  it("does not validate the nested values handled by positional mounting", () => {
    expect(() =>
      validateComponentFactoryInvocationOptions({
        mountOptions: { plugins: { pinia: { stubActions: true } } },
        extraOptions: { plugins: { pinia: { stubActions: false } } },
      }),
    ).not.toThrow();
  });

  it("does not mutate the options object", () => {
    const options = {
      props: { title: "Hello" },
      extraOptions: { presetKey: "default" },
    };
    const snapshot = structuredClone(options);

    validateComponentFactoryInvocationOptions(options);

    expect(options).toEqual(snapshot);
  });
});
