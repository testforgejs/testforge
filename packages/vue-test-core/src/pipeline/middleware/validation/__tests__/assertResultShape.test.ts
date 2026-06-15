import { describe, it, expect } from "vitest";
import { assertResultShape, assertFinalResultShape } from "../assertResultShape";
import { ERROR_PREFIX } from "../../../../constants/constants.js";

import type { PipelineContext } from "../../../../types";

// Register the list of middleware to be tested for parameterization
const middlewares = [
  { name: "assertResultShape", fn: assertResultShape },
  { name: "assertFinalResultShape", fn: assertFinalResultShape },
];

describe("Result shape validation middleware layers", () => {
  describe.each(middlewares)("Positive cases for $name", ({ fn }) => {
    // Arrange
    const validCtx = {
      defaultMountOptions: { global: { plugins: [] } },
      mountOptions: {},
      extraOptions: {},
      supportedPlugins: {},
      preset: {
        manifest: [],
        defaults: {},
      },
      result: {
        mountOptions: { props: {} },
        global: { plugins: [] },
        pluginDefaultsState: {},
        plugins: { router: {} },
      },
    };

    it("should pass when result shape is valid", () => {
      expect(() => fn(validCtx)).not.toThrow();
    });

    it("should return the exact same context reference when the result structure is fully valid", () => {
      // Act
      const result = fn(validCtx);

      // Assert
      expect(result).toBe(validCtx); // Verifying the link's identity in memory
    });
  });

  describe.each(middlewares)("Negative cases for $name", ({ fn }) => {
    it("should throw an error when the top-level 'result' container is missing", () => {
      // Arrange
      const invalidCtx = {
        defaultMountOptions: { global: { plugins: [] } },
        mountOptions: {},
        extraOptions: {},
        supportedPlugins: {},
        preset: {
          manifest: [],
          defaults: {},
        },
      } as unknown as PipelineContext;

      // Act & Assert
      expect(() => fn(invalidCtx)).toThrow(
        `${ERROR_PREFIX} Critical error: "result" must be an Object. Received undefined (undefined)`,
      );
    });

    it("should throw an error when 'result' is present but is not a valid object", () => {
      // Arrange
      const invalidCtx = {
        defaultMountOptions: { global: { plugins: [] } },
        mountOptions: {},
        extraOptions: {},
        supportedPlugins: {},
        preset: {
          manifest: [],
          defaults: {},
        },
        result: null,
      } as unknown as PipelineContext;

      // Act & Assert
      expect(() => fn(invalidCtx)).toThrow(
        `${ERROR_PREFIX} Critical error: "result" must be an Object. Received object (null)`,
      );
    });

    it("should throw an error when 'mountOptions' container is missing inside result", () => {
      // Arrange
      const invalidCtx = {
        result: {
          global: {},
          pluginDefaultsState: {},
          plugins: {},
        },
      } as unknown as PipelineContext;

      // Act & Assert
      expect(() => fn(invalidCtx)).toThrow(
        `${ERROR_PREFIX} Critical error: "result.mountOptions" must be an Object. Received undefined (undefined)`,
      );
    });

    it("should throw an error when 'mountOptions' container is invalid", () => {
      // Arrange
      const invalidCtx = {
        result: {
          mountOptions: true,
          global: {},
          pluginDefaultsState: {},
          plugins: {},
        },
      } as unknown as PipelineContext;

      // Act & Assert
      expect(() => fn(invalidCtx)).toThrow(
        `${ERROR_PREFIX} Critical error: "result.mountOptions" must be an Object. Received boolean (true)`,
      );
    });

    it("should throw an error when 'global' container is missing inside result", () => {
      // Arrange
      const invalidCtx = {
        result: {
          mountOptions: {},
          pluginDefaultsState: {},
          plugins: {},
        },
      } as unknown as PipelineContext;

      // Act & Assert
      expect(() => fn(invalidCtx)).toThrow(
        `${ERROR_PREFIX} Critical error: "result.global" must be an Object. Received undefined (undefined)`,
      );
    });

    it("should throw an error when result.global is invalid", () => {
      const invalidCtx = {
        result: {
          mountOptions: {},
          global: 123,
          plugins: {},
        },
      } as unknown as PipelineContext;

      expect(() => assertResultShape(invalidCtx)).toThrow(
        `${ERROR_PREFIX} Critical error: "result.global" must be an Object. Received number (123)`,
      );
    });

    it("should throw an error when 'plugins' container is missing inside result", () => {
      // Arrange
      const invalidCtx = {
        result: {
          mountOptions: {},
          global: {},
          pluginDefaultsState: {},
        },
      } as unknown as PipelineContext;

      // Act & Assert
      expect(() => fn(invalidCtx)).toThrow(
        `${ERROR_PREFIX} Critical error: "result.plugins" must be an Object. Received undefined (undefined)`,
      );
    });

    it("should throw an error when result.plugins is invalid", () => {
      const invalidCtx = {
        result: {
          mountOptions: {},
          global: {},
          plugins: 123,
        },
      } as unknown as PipelineContext;

      expect(() => assertResultShape(invalidCtx)).toThrow(
        `${ERROR_PREFIX} Critical error: "result.plugins" must be an Object. Received number (123)`,
      );
    });
  });
});
