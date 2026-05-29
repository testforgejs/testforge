/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",

  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },

  moduleFileExtensions: ["js", "ts", "json", "vue"],

  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.jest.json",
      },
    ],
    "^.+\\.[mc]?js$": "babel-jest",
  },

  transformIgnorePatterns: [
    "/node_modules/(?!(vue|@vue|pinia|@pinia|@vue/test-utils|vue-i18n|vue-router|perfect-debounce)/)",
  ],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",

    "^@testforge/([^/]+)/(.*)$": "<rootDir>/packages/$1/$2",
    "^@testforge/([^/]+)$": "<rootDir>/packages/$1/src/index",

    "^vue$": "@vue/runtime-dom",
    "^@vue/devtools-api$": "<rootDir>/__mocks__/vue-devtools-api.cjs",
  },

  testMatch: ["**/*.jest.test.js", "**/*.int.test.js"],
};
