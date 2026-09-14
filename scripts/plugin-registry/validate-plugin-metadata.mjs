const SUPPORTED_SCHEMA_VERSION = 1;
const PLUGIN_PACKAGE_PREFIX = "@testforgejs/vue-test-plugin-";
const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * @typedef {object} PluginRegistryEntry
 * @property {string} packageName
 * @property {string} exportName
 * @property {string} displayName
 * @property {string} description
 */

/**
 * Validates plugin metadata from an external package.json and converts it
 * into a normalized plugin registry entry.
 *
 * @param {unknown} packageJson
 * @param {string} packagePath
 * @returns {PluginRegistryEntry}
 */
export function validatePluginMetadata(packageJson, packagePath) {
  const metadata = packageJson && typeof packageJson === "object" && packageJson.testforge?.plugin;

  if (!metadata || typeof metadata !== "object") {
    throw new Error(`Missing "testforge.plugin" metadata in ${packagePath}`);
  }

  if (metadata.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    throw new Error(
      [
        `Unsupported TestForge plugin metadata schema in ${packagePath}.`,
        `Expected schemaVersion ${SUPPORTED_SCHEMA_VERSION},`,
        `received ${metadata.schemaVersion ?? "missing"}.`,
      ].join(" "),
    );
  }

  if (typeof metadata.displayName !== "string" || metadata.displayName.trim() === "") {
    throw new Error(`Invalid "testforge.plugin.displayName" in ${packagePath}`);
  }

  if (typeof metadata.description !== "string" || metadata.description.trim() === "") {
    throw new Error(`Invalid "testforge.plugin.description" in ${packagePath}`);
  }

  if (typeof metadata.exportName !== "string" || !IDENTIFIER_PATTERN.test(metadata.exportName)) {
    throw new Error(`Invalid "testforge.plugin.exportName" in ${packagePath}`);
  }

  if (typeof packageJson.name !== "string" || !packageJson.name.startsWith(PLUGIN_PACKAGE_PREFIX)) {
    throw new Error(`Invalid plugin package name in ${packagePath}: ${packageJson.name}`);
  }

  return {
    packageName: packageJson.name,
    exportName: metadata.exportName,
    displayName: metadata.displayName,
    description: metadata.description,
  };
}
