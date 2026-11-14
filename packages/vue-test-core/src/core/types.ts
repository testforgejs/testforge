import type { TestFrameworkPresets } from "../types.js";

/**
 * Internal dependencies shared by component factories created by a framework.
 * Each createTestFramework() call supplies its own runtime context.
 */
export interface FrameworkRuntimeContext {
  readonly presets: TestFrameworkPresets;
  readonly shallowByDefault: boolean;
}
