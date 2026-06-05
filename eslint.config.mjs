import js from "@eslint/js";
import globals from "globals";
import jsdoc from "eslint-plugin-jsdoc";
import prettierConfig from "eslint-config-prettier";
import tsEslint from "typescript-eslint";

export default tsEslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/coverage/**",
      "eslint.config.mjs",
      "tsup.config.base.js",
      "**/tsup.config.js",
      "jest.config.cjs",
    ],
  },

  js.configs.recommended,
  ...tsEslint.configs.recommended,

  //jsdoc.configs["flat/recommended-typescript"],

  {
    files: ["**/*.{js,mjs,ts}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.jest,
        vi: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
      },
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      jsdoc: jsdoc,
    },
    rules: {
      "jsdoc/check-access": "warn",
      "jsdoc/check-alignment": "warn",
      "jsdoc/check-param-names": "warn",
      "jsdoc/check-property-names": "warn",
      "jsdoc/check-types": "warn",
      "jsdoc/require-param": "warn",
      "jsdoc/require-param-type": "warn",
      "jsdoc/require-returns": "warn",
      "jsdoc/require-returns-type": "warn",

      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-require-imports": "off",
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "warn",

      "no-console": "off",
    },
  },

  {
    files: ["**/*.ts"],
    rules: {
      // Disable type annotations in JSDoc—TS knows them itself
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns-type": "off",
      // Disable type checking for unknown types—TS will throw a compilation error if the type does not exist
      "jsdoc/no-undefined-types": "off",
    },
  },

  {
    files: ["**/*.type-spec.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },

  {
    files: ["packages/**/test-d/**/*.test-d.ts", "packages/**/test-d/**/shared-plugin-types.ts"],
    extends: [tsEslint.configs.disableTypeChecked],
  },

  {
    files: ["scripts/**/*.js", "scripts/**/*.ts"],
    extends: [tsEslint.configs.disableTypeChecked],
  },

  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },

  prettierConfig,
);
