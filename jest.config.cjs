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
    "[/\\\\]node_modules[/\\\\](?!\\.pnpm[/\\\\])(?!(pinia|@pinia|nostics)[/\\\\])",
  ],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",

    "^@testforgejs/([^/]+)/(.*)$": "<rootDir>/packages/$1/$2",
    "^@testforgejs/([^/]+)$": "<rootDir>/packages/$1/src/index",

    "^vue$": "@vue/runtime-dom",
  },

  testMatch: ["**/*.jest.test.js", "**/*.int.test.js"],
};
