import type { Component } from "vue";

import { ERROR_PREFIX } from "../constants/constants.js";

/*
 * Validates a Vue component supplied to a component factory.
 *
 * Accepts component option objects and functional components.
 * This is a structural check, not a complete Vue component validation.
 */
export function validateComponent(component: unknown): asserts component is Component {
  const isValid =
    typeof component === "function" ||
    (typeof component === "object" && component !== null && !Array.isArray(component));

  if (!isValid) {
    throw new Error(`${ERROR_PREFIX} "component" must be a Vue component (object or function).`);
  }
}
