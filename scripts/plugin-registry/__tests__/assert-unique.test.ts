import { describe, expect, it } from "vitest";
import { assertUnique } from "../assert-unique.mjs";

describe("assertUnique", () => {
  describe("when all values are unique", () => {
    it("should not throw for unique displayNames", () => {
      const items = [
        {
          packageName: "@testforgejs/vue-test-plugin-i18n",
          displayName: "Vue I18n",
        },
        {
          packageName: "@testforgejs/vue-test-plugin-pinia",
          displayName: "Pinia",
        },
      ];

      expect(() => assertUnique(items, "displayName")).not.toThrow();
    });

    it("should not throw for an empty array", () => {
      expect(() => assertUnique([], "displayName")).not.toThrow();
    });

    it("should not throw for unique packageNames", () => {
      const items = [
        {
          packageName: "@testforgejs/vue-test-plugin-i18n",
          displayName: "Vue I18n",
        },
        {
          packageName: "@testforgejs/vue-test-plugin-pinia",
          displayName: "Pinia",
        },
      ];

      expect(() => assertUnique(items, "packageName")).not.toThrow();
    });
  });

  describe("when a value is duplicated", () => {
    it("should throw for duplicate displayNames (adjacent)", () => {
      const items = [
        {
          packageName: "@testforgejs/vue-test-plugin-i18n",
          displayName: "Vue I18n",
        },
        {
          packageName: "@testforgejs/vue-test-plugin-pinia",
          displayName: "Pinia",
        },
        {
          packageName: "@testforgejs/vue-test-plugin-i18n-copy",
          displayName: "Vue I18n",
        },
      ];

      expect(() => assertUnique(items, "displayName")).toThrow(
        'Duplicate plugin displayName "Vue I18n" found in ' +
          "@testforgejs/vue-test-plugin-i18n and " +
          "@testforgejs/vue-test-plugin-i18n-copy",
      );
    });

    it("should throw for duplicate displayNames (not adjacent)", () => {
      const items = [
        {
          packageName: "@testforgejs/vue-test-plugin-i18n",
          displayName: "Vue I18n",
        },
        {
          packageName: "@testforgejs/vue-test-plugin-pinia",
          displayName: "Pinia",
        },
        {
          packageName: "@testforgejs/vue-test-plugin-router",
          displayName: "Vue Router",
        },
        {
          packageName: "@testforgejs/vue-test-plugin-i18n-copy",
          displayName: "Vue I18n",
        },
      ];

      expect(() => assertUnique(items, "displayName")).toThrow(
        'Duplicate plugin displayName "Vue I18n" found in ' +
          "@testforgejs/vue-test-plugin-i18n and " +
          "@testforgejs/vue-test-plugin-i18n-copy",
      );
    });

    it("should throw for duplicate packageNames", () => {
      const items = [
        {
          packageName: "@testforgejs/vue-test-plugin-i18n",
          displayName: "Vue I18n",
        },
        {
          packageName: "@testforgejs/vue-test-plugin-i18n",
          displayName: "Another I18n",
        },
      ];

      expect(() => assertUnique(items, "packageName")).toThrow(
        'Duplicate plugin packageName "@testforgejs/vue-test-plugin-i18n" found in ' +
          "@testforgejs/vue-test-plugin-i18n and " +
          "@testforgejs/vue-test-plugin-i18n",
      );
    });

    it("should include both package names in the error message", () => {
      const items = [
        {
          packageName: "first-package",
          exportName: "firstPlugin",
        },
        {
          packageName: "second-package",
          exportName: "firstPlugin",
        },
      ];

      expect(() => assertUnique(items, "exportName")).toThrow(
        'Duplicate plugin exportName "firstPlugin" found in first-package and second-package',
      );
    });
  });
});
