const SUPPORTED_SCHEMA_VERSION = 1;
const PLUGIN_PACKAGE_PREFIX = "@testforgejs/vue-test-plugin-";

/**
 * @typedef {object} PluginMetadata
 * @property {string} packageName
 * @property {string} displayName
 * @property {string} description
 */

/**
 * @param {unknown} packageJson
 * @param {string} packagePath
 * @returns {PluginMetadata}
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

  if (typeof packageJson.name !== "string" || !packageJson.name.startsWith(PLUGIN_PACKAGE_PREFIX)) {
    throw new Error(`Invalid plugin package name in ${packagePath}: ${packageJson.name}`);
  }

  if (typeof packageJson.description !== "string" || packageJson.description.trim() === "") {
    throw new Error(`Invalid package description in ${packagePath}`);
  }

  return {
    packageName: packageJson.name,
    displayName: metadata.displayName,
    description: packageJson.description,
  };
}
