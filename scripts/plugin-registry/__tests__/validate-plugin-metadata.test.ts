import { describe, expect, it } from "vitest";

import { validatePluginMetadata } from "../validate-plugin-metadata.mjs";

const packagePath = "/packages/vue-test-plugin-pinia/package.json";

const validPackageJson = {
  name: "@testforgejs/vue-test-plugin-pinia",
  description: "Pinia store integration",
  testforge: {
    plugin: {
      schemaVersion: 1,
      displayName: "Pinia",
    },
  },
};

describe("validatePluginMetadata", () => {
  it("should return a plugin registry entry for valid metadata", () => {
    expect(validatePluginMetadata(validPackageJson, packagePath)).toEqual({
      packageName: "@testforgejs/vue-test-plugin-pinia",
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
            description: "Pinia store integration",
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
            description: "Pinia store integration",
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

  describe("package description", () => {
    it("should reject a missing description", () => {
      const packageJson = {
        ...validPackageJson,
        description: undefined,
      };

      expect(() => validatePluginMetadata(packageJson, packagePath)).toThrow(
        `Invalid package description in ${packagePath}`,
      );
    });

    it("should reject an empty description", () => {
      const packageJson = {
        ...validPackageJson,
        description: "",
      };

      expect(() => validatePluginMetadata(packageJson, packagePath)).toThrow(
        `Invalid package description in ${packagePath}`,
      );
    });

    it("should reject a whitespace-only description", () => {
      const packageJson = {
        ...validPackageJson,
        description: "   ",
      };

      expect(() => validatePluginMetadata(packageJson, packagePath)).toThrow(
        `Invalid package description in ${packagePath}`,
      );
    });
  });
});
