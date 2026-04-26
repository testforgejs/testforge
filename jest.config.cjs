module.exports = {
  testEnvironment: "jsdom",

  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },

  moduleFileExtensions: ["js", "json", "vue"],

  transform: {
    "^.+\\.[mc]?js$": "babel-jest",
  },

  transformIgnorePatterns: [
    "/node_modules/(?!(vue|@vue|pinia|@pinia|@vue/test-utils|vue-i18n|vue-router|perfect-debounce)/)",
  ],

  moduleNameMapper: {
    "^@testforge/([^/]+)/(.*)$": "<rootDir>/packages/$1/$2",
    "^@testforge/([^/]+)$": "<rootDir>/packages/$1/src/index.js",
    "^vue$": "@vue/runtime-dom",

    "^@vue/devtools-api$": "<rootDir>/__mocks__/vue-devtools-api.js",
    //"^@vue/devtools-kit$": "<rootDir>/__mocks__/empty.js",
  },

  testMatch: ["**/*.jest.test.js", "**/*.int.test.js"],
};
