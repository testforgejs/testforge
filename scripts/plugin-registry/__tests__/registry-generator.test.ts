import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { generatePluginRegistry } from "../registry-generator.mjs";

describe("generatePluginRegistry", () => {
  let tempDirectory: string;

  afterEach(async () => {
    if (tempDirectory) {
      await fs.rm(tempDirectory, {
        recursive: true,
        force: true,
      });
    }
  });

  it("should generate a plugin registry from plugin packages", async () => {
    tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "testforge-plugin-registry-"));

    const pluginsDirectory = path.join(tempDirectory, "packages");
    const outputFile = path.join(tempDirectory, "generated", "plugin-registry.ts");

    await createPluginPackage(pluginsDirectory, "vue-test-plugin-pinia", {
      name: "@testforgejs/vue-test-plugin-pinia",
      description: "Pinia store integration",
      testforge: {
        plugin: {
          schemaVersion: 1,
          displayName: "Pinia",
        },
      },
    });

    await createPluginPackage(pluginsDirectory, "vue-test-plugin-router", {
      name: "@testforgejs/vue-test-plugin-router",
      description: "Vue Router integration",
      testforge: {
        plugin: {
          schemaVersion: 1,
          displayName: "Vue Router",
        },
      },
    });

    const plugins = await generatePluginRegistry({
      pluginsDirectory,
      outputFile,
    });

    expect(plugins).toEqual([
      {
        packageName: "@testforgejs/vue-test-plugin-pinia",
        displayName: "Pinia",
        description: "Pinia store integration",
      },
      {
        packageName: "@testforgejs/vue-test-plugin-router",
        displayName: "Vue Router",
        description: "Vue Router integration",
      },
    ]);

    const source = await fs.readFile(outputFile, "utf8");

    expect(source).toContain('packageName: "@testforgejs/vue-test-plugin-pinia"');
    expect(source).toContain('displayName: "Pinia"');
    expect(source).toContain('description: "Pinia store integration"');

    expect(source).toContain('packageName: "@testforgejs/vue-test-plugin-router"');
    expect(source).toContain('displayName: "Vue Router"');
    expect(source).toContain('description: "Vue Router integration"');

    expect(source).not.toContain("exportName");
  });
});

async function createPluginPackage(
  pluginsDirectory: string,
  directoryName: string,
  packageJson: Record<string, unknown>,
) {
  const packageDirectory = path.join(pluginsDirectory, directoryName);

  await fs.mkdir(packageDirectory, {
    recursive: true,
  });

  await fs.writeFile(
    path.join(packageDirectory, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );
}
