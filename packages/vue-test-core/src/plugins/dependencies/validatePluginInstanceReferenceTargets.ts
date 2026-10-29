import { ERROR_PREFIX } from "../../constants/constants.js";

import type { PluginDependency } from "./types.js";
import type { PluginName, PluginRegistry } from "../../types.js";

/*
 * Validates that every plugin targeted by an instance dependency
 * supports runtime instance references.
 *
 * Dependency activity and graph integrity are validated separately by
 * validatePluginDependencyGraph(). This validator only checks the runtime
 * instance-reference capability declared by plugin definitions.
 */
export function validatePluginInstanceReferenceTargets(
  dependencies: readonly PluginDependency[],
  registry: Pick<PluginRegistry, "get">,
): void {
  const validatedTargets = new Set<PluginName>();

  for (const { pluginName, dependsOn } of dependencies) {
    if (validatedTargets.has(dependsOn)) {
      continue;
    }

    const definition = registry.get(dependsOn);

    if (!definition) {
      throw new Error(
        `${ERROR_PREFIX} Plugin "${dependsOn}" is missing from the plugin registry while validating instance references.`,
      );
    }

    if (!definition.supportsInstanceReferences) {
      throw new Error(
        `${ERROR_PREFIX} Plugin "${pluginName}" depends on plugin "${dependsOn}", which does not support instance references.`,
      );
    }

    validatedTargets.add(dependsOn);
  }
}
