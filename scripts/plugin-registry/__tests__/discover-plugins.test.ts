import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { discoverPlugins } from "../discover-plugins.mjs";

const temporaryDirectories: string[] = [];

async function createPluginsDirectory() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "testforge-plugins-"));

  temporaryDirectories.push(directory);

  return directory;
}

async function createPlugin(directory: string, name: string, packageJson: Record<string, unknown>) {
  const pluginDirectory = path.join(directory, name);

  await fs.mkdir(pluginDirectory, {
    recursive: true,
  });

  await fs.writeFile(path.join(pluginDirectory, "package.json"), JSON.stringify(packageJson));
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, {
        recursive: true,
        force: true,
      }),
    ),
  );
});

describe("discoverPlugins", () => {
  it("discovers plugins from matching directories", async () => {
    const directory = await createPluginsDirectory();

    await createPlugin(directory, "vue-test-plugin-pinia", {
      name: "@testforgejs/vue-test-plugin-pinia",
      testforge: {
        plugin: {
          schemaVersion: 1,
          displayName: "Pinia",
          description: "Pinia store integration",
          exportName: "piniaPlugin",
        },
      },
    });

    await createPlugin(directory, "vue-test-plugin-router", {
      name: "@testforgejs/vue-test-plugin-router",
      testforge: {
        plugin: {
          schemaVersion: 1,
          displayName: "Vue Router",
          description: "Vue Router integration",
          exportName: "routerPlugin",
        },
      },
    });

    await createPlugin(directory, "some-other-package", {
      name: "@testforgejs/some-other-package",
    });

    await expect(discoverPlugins(directory)).resolves.toEqual([
      {
        packageName: "@testforgejs/vue-test-plugin-pinia",
        exportName: "piniaPlugin",
        displayName: "Pinia",
        description: "Pinia store integration",
      },
      {
        packageName: "@testforgejs/vue-test-plugin-router",
        exportName: "routerPlugin",
        displayName: "Vue Router",
        description: "Vue Router integration",
      },
    ]);
  });

  it("discovers plugins in directory name order", async () => {
    const directory = await createPluginsDirectory();

    await createPlugin(directory, "vue-test-plugin-vuetify", {
      name: "@testforgejs/vue-test-plugin-vuetify",
      testforge: {
        plugin: {
          schemaVersion: 1,
          displayName: "Vuetify",
          description: "Vuetify integration",
          exportName: "vuetifyPlugin",
        },
      },
    });

    await createPlugin(directory, "vue-test-plugin-i18n", {
      name: "@testforgejs/vue-test-plugin-i18n",
      testforge: {
        plugin: {
          schemaVersion: 1,
          displayName: "Vue I18n",
          description: "Vue I18n integration",
          exportName: "i18nPlugin",
        },
      },
    });

    await createPlugin(directory, "vue-test-plugin-pinia", {
      name: "@testforgejs/vue-test-plugin-pinia",
      testforge: {
        plugin: {
          schemaVersion: 1,
          displayName: "Pinia",
          description: "Pinia store integration",
          exportName: "piniaPlugin",
        },
      },
    });

    const plugins = await discoverPlugins(directory);

    expect(plugins.map((plugin) => plugin.packageName)).toEqual([
      "@testforgejs/vue-test-plugin-i18n",
      "@testforgejs/vue-test-plugin-pinia",
      "@testforgejs/vue-test-plugin-vuetify",
    ]);
  });

  it("ignores files and directories that do not match the plugin prefix", async () => {
    const directory = await createPluginsDirectory();

    await createPlugin(directory, "vue-test-plugin-pinia", {
      name: "@testforgejs/vue-test-plugin-pinia",
      testforge: {
        plugin: {
          schemaVersion: 1,
          displayName: "Pinia",
          description: "Pinia store integration",
          exportName: "piniaPlugin",
        },
      },
    });

    await fs.writeFile(path.join(directory, "vue-test-plugin-not-a-directory"), "not a directory");

    await fs.mkdir(path.join(directory, "other-package"));

    const plugins = await discoverPlugins(directory);

    expect(plugins).toEqual([
      {
        packageName: "@testforgejs/vue-test-plugin-pinia",
        exportName: "piniaPlugin",
        displayName: "Pinia",
        description: "Pinia store integration",
      },
    ]);
  });

  it("returns an empty array when no plugin directories are found", async () => {
    const directory = await createPluginsDirectory();

    await fs.mkdir(path.join(directory, "other-package"));

    await expect(discoverPlugins(directory)).resolves.toEqual([]);
  });

  it("propagates an error when a plugin package.json is invalid", async () => {
    const directory = await createPluginsDirectory();

    const pluginDirectory = path.join(directory, "vue-test-plugin-pinia");

    await fs.mkdir(pluginDirectory);

    const packagePath = path.join(pluginDirectory, "package.json");

    await fs.writeFile(packagePath, "{ invalid json");

    await expect(discoverPlugins(directory)).rejects.toThrow(`Invalid JSON: ${packagePath}`);
  });

  it("propagates plugin metadata validation errors", async () => {
    const directory = await createPluginsDirectory();

    await createPlugin(directory, "vue-test-plugin-pinia", {
      name: "@testforgejs/vue-test-plugin-pinia",
    });

    const packagePath = path.join(directory, "vue-test-plugin-pinia", "package.json");

    await expect(discoverPlugins(directory)).rejects.toThrow(
      `Missing "testforge.plugin" metadata in ${packagePath}`,
    );
  });
});
