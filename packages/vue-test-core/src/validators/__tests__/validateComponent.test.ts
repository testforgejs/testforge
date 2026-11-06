import { describe, it, expect } from "vitest";
import { defineComponent } from "vue";

import { ERROR_PREFIX } from "../../constants/constants.js";
import { validateComponent } from "../validateComponent.js";

describe("validateComponent", () => {
  it("should accept an object component", () => {
    const component = {
      name: "TestComponent",
      render: () => null,
    };

    expect(() => validateComponent(component)).not.toThrow();
  });

  it("should accept a component created with defineComponent", () => {
    const component = defineComponent({
      name: "TestComponent",
      render: () => null,
    });

    expect(() => validateComponent(component)).not.toThrow();
  });

  it("should accept a functional component", () => {
    const component = () => null;

    expect(() => validateComponent(component)).not.toThrow();
  });

  it.each([undefined, null, false, true, 0, 123, "", "div", [], [1, 2, 3], Symbol("component")])(
    "should reject invalid component value: %s",
    (component) => {
      expect(() => validateComponent(component)).toThrow(
        `${ERROR_PREFIX} "component" must be a Vue component`,
      );
    },
  );
});
