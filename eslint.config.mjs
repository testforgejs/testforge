import js from "@eslint/js";
import globals from "globals";
import jsdoc from "eslint-plugin-jsdoc";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
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
      prettier: prettierPlugin,
    },
    rules: {
      "jsdoc/check-access": "warn",
      "jsdoc/check-alignment": "warn",
      "jsdoc/check-param-names": "warn",
      "jsdoc/check-property-names": "warn",
      "jsdoc/check-types": "warn",
      "jsdoc/no-undefined-types": [
        "warn",
        {
          definedTypes: [
            // 1. Basic types
            "PluginName",
            "ExposePluginInstance",

            // 2. Plugin Options
            "MockStoresFn",
            "PiniaPluginOptions",
            "I18nPluginOptions",
            "RouterPluginOptions",

            // 3. Registry & Modules
            "PluginDefinition",
            "PluginModule",
            "PluginRegistry",
            "SupportedPluginsMap",

            // 4. Pipeline Context
            "CreateMountContextParams",
            "MountContextResult",
            "MountContext",
            "PipelineMiddleware",
            "Pipeline",

            // 5. Component Factory & Presets
            "BasePluginOption",
            "KnownPluginOptions",
            "PluginOptions",
            "ComponentFactoryOptions",
            "ComponentFactory",
            "PluginManifestEntry",
            "PresetDefinition",
            "TestFrameworkPresets",
          ],
        },
      ],
      "jsdoc/require-param": "warn",
      "jsdoc/require-param-type": "warn",
      "jsdoc/require-returns": "warn",
      "jsdoc/require-returns-type": "warn",

      "prettier/prettier": "error",

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

  prettierConfig,
);
