import { describe, expect, it } from "vitest";
import { validatePluginMetadata } from "../validate-plugin-metadata.mjs";

const packagePath = "/packages/vue-test-plugin-pinia/package.json";

const validPackageJson = {
  name: "@testforgejs/vue-test-plugin-pinia",
  testforge: {
    plugin: {
      schemaVersion: 1,
      displayName: "Pinia",
      description: "Pinia store integration",
      exportName: "piniaPlugin",
    },
  },
};

describe("validatePluginMetadata", () => {
  it("should return a plugin registry entry for valid metadata", () => {
    expect(validatePluginMetadata(validPackageJson, packagePath)).toEqual({
      packageName: "@testforgejs/vue-test-plugin-pinia",
      exportName: "piniaPlugin",
      displayName: "Pinia",
      description: "Pinia store integration",
    });
  });

  describe("Non-object package.json", () => {
    it.each([null, undefined, "invalid", 123, true, []])(
      "rejects non-object package.json values",
      (packageJson) => {
        expect(() => validatePluginMetadata(packageJson, packagePath)).toThrow(
          `Missing "testforge.plugin" metadata in ${packagePath}`,
        );
      },
    );
  });

  describe("testforge.plugin metadata", () => {
    it("should reject missing metadata", () => {
      expect(() =>
        validatePluginMetadata(
          {
            name: "@testforgejs/vue-test-plugin-pinia",
          },
          packagePath,
        ),
      ).toThrow(`Missing "testforge.plugin" metadata in ${packagePath}`);
    });

    it("should reject non-object metadata", () => {
      expect(() =>
        validatePluginMetadata(
          {
            name: "@testforgejs/vue-test-plugin-pinia",
            testforge: {
              plugin: "invalid",
            },
          },
          packagePath,
        ),
      ).toThrow(`Missing "testforge.plugin" metadata in ${packagePath}`);
    });
  });

  describe("schemaVersion", () => {
    it("should accept schema version 1", () => {
      expect(() => validatePluginMetadata(validPackageJson, packagePath)).not.toThrow();
    });

    it("should reject a missing schema version", () => {
      const packageJson = {
        ...validPackageJson,
        testforge: {
          plugin: {
            ...validPackageJson.testforge.plugin,
            schemaVersion: undefined,
          },
        },
      };

      expect(() => validatePluginMetadata(packageJson, packagePath)).toThrow(
        `Unsupported TestForge plugin metadata schema in ${packagePath}. Expected schemaVersion 1, received missing.`,
      );
    });

    it("should reject an unsupported schema version", () => {
      const packageJson = {
        ...validPackageJson,
        testforge: {
          plugin: {
            ...validPackageJson.testforge.plugin,
            schemaVersion: 2,
          },
        },
      };

      expect(() => validatePluginMetadata(packageJson, packagePath)).toThrow(
        `Unsupported TestForge plugin metadata schema in ${packagePath}. Expected schemaVersion 1, received 2.`,
      );
    });
  });

  describe("displayName", () => {
    it("should reject a missing display name", () => {
      const packageJson = {
        ...validPackageJson,
        testforge: {
          plugin: {
            ...validPackageJson.testforge.plugin,
            displayName: undefined,
          },
        },
      };

      expect(() => validatePluginMetadata(packageJson, packagePath)).toThrow(
        `Invalid "testforge.plugin.displayName" in ${packagePath}`,
      );
    });

    it("should reject an empty display name", () => {
      const packageJson = {
        ...validPackageJson,
        testforge: {
          plugin: {
            ...validPackageJson.testforge.plugin,
            displayName: "",
          },
        },
      };

      expect(() => validatePluginMetadata(packageJson, packagePath)).toThrow(
        `Invalid "testforge.plugin.displayName" in ${packagePath}`,
      );
    });

    it("should reject a whitespace-only display name", () => {
      const packageJson = {
        ...validPackageJson,
        testforge: {
          plugin: {
            ...validPackageJson.testforge.plugin,
            displayName: "   ",
          },
        },
      };

      expect(() => validatePluginMetadata(packageJson, packagePath)).toThrow(
        `Invalid "testforge.plugin.displayName" in ${packagePath}`,
      );
    });
  });

  describe("description", () => {
    it("should reject a missing description", () => {
      const packageJson = {
        ...validPackageJson,
        testforge: {
          plugin: {
            ...validPackageJson.testforge.plugin,
            description: undefined,
          },
        },
      };

      expect(() => validatePluginMetadata(packageJson, packagePath)).toThrow(
        `Invalid "testforge.plugin.description" in ${packagePath}`,
      );
    });

    it("should reject an empty description", () => {
      const packageJson = {
        ...validPackageJson,
        testforge: {
          plugin: {
            ...validPackageJson.testforge.plugin,
            description: "",
          },
        },
      };

      expect(() => validatePluginMetadata(packageJson, packagePath)).toThrow(
        `Invalid "testforge.plugin.description" in ${packagePath}`,
      );
    });

    it("should reject a whitespace-only description", () => {
      const packageJson = {
        ...validPackageJson,
        testforge: {
          plugin: {
            ...validPackageJson.testforge.plugin,
            description: "   ",
          },
        },
      };

      expect(() => validatePluginMetadata(packageJson, packagePath)).toThrow(
        `Invalid "testforge.plugin.description" in ${packagePath}`,
      );
    });
  });

  describe("exportName", () => {
    it("should accept a valid JavaScript identifier", () => {
      const packageJson = {
        ...validPackageJson,
        testforge: {
          plugin: {
            ...validPackageJson.testforge.plugin,
            exportName: "_piniaPlugin",
          },
        },
      };

      expect(() => validatePluginMetadata(packageJson, packagePath)).not.toThrow();
    });

    it("should reject a missing export name", () => {
      const packageJson = {
        ...validPackageJson,
        testforge: {
          plugin: {
            ...validPackageJson.testforge.plugin,
            exportName: undefined,
          },
        },
      };

      expect(() => validatePluginMetadata(packageJson, packagePath)).toThrow(
        `Invalid "testforge.plugin.exportName" in ${packagePath}`,
      );
    });

    it("should reject an empty export name", () => {
      const packageJson = {
        ...validPackageJson,
        testforge: {
          plugin: {
            ...validPackageJson.testforge.plugin,
            exportName: "",
          },
        },
      };

      expect(() => validatePluginMetadata(packageJson, packagePath)).toThrow(
        `Invalid "testforge.plugin.exportName" in ${packagePath}`,
      );
    });

    it("should reject an invalid JavaScript identifier", () => {
      const packageJson = {
        ...validPackageJson,
        testforge: {
          plugin: {
            ...validPackageJson.testforge.plugin,
            exportName: "pinia-plugin",
          },
        },
      };

      expect(() => validatePluginMetadata(packageJson, packagePath)).toThrow(
        `Invalid "testforge.plugin.exportName" in ${packagePath}`,
      );
    });
  });

  describe("package name", () => {
    it("should reject a missing package name", () => {
      const packageJson = {
        ...validPackageJson,
        name: undefined,
      };

      expect(() => validatePluginMetadata(packageJson, packagePath)).toThrow(
        `Invalid plugin package name in ${packagePath}: undefined`,
      );
    });

    it("should reject a package outside the TestForge plugin namespace", () => {
      const packageJson = {
        ...validPackageJson,
        name: "@testforgejs/vue-test-core",
      };

      expect(() => validatePluginMetadata(packageJson, packagePath)).toThrow(
        `Invalid plugin package name in ${packagePath}: @testforgejs/vue-test-core`,
      );
    });

    it("should accept a package in the TestForge plugin namespace", () => {
      expect(() => validatePluginMetadata(validPackageJson, packagePath)).not.toThrow();
    });
  });
});
