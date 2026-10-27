// packages/vue-test-core/src/__types__/plugin-options.type-spec.ts

import { describe, expectTypeOf, it } from "vitest";

import { PLUGIN_META_KEY } from "../constants/constants.js";

import type { PluginOptionsInput } from "../types.js";

declare module "../types.js" {
  interface PluginOptionsMap {
    requiredPluginTypeSpec: {
      apiKey: string;
      environment: "development" | "production";
      debug?: boolean;
    };
  }
}

type RequiredPluginInput = NonNullable<PluginOptionsInput["requiredPluginTypeSpec"]>;

describe("PluginOptionsInput type assertions", () => {
  it("should require native options when no plugin instance is provided", () => {
    type MissingRequiredOptions = {
      debug: true;
    };

    expectTypeOf<MissingRequiredOptions>().not.toExtend<RequiredPluginInput>();
  });

  it("should reject metadata without an instance when required native options are missing", () => {
    type MissingInstanceMetadata = {
      debug: true;
      [PLUGIN_META_KEY]: Record<string, never>;
    };

    expectTypeOf<MissingInstanceMetadata>().not.toExtend<RequiredPluginInput>();
  });

  it("should allow omitting required native options when a plugin instance is provided", () => {
    type ValidInstanceMetadata = {
      [PLUGIN_META_KEY]: {
        instance: {
          install(): void;
        };
      };
    };

    expectTypeOf<ValidInstanceMetadata>().toExtend<RequiredPluginInput>();
  });

  it("should allow combining a plugin instance with partial native options", () => {
    type InstanceWithPartialOptions = {
      debug: true;
      [PLUGIN_META_KEY]: {
        instance: {
          install(): void;
        };
      };
    };

    expectTypeOf<InstanceWithPartialOptions>().toExtend<RequiredPluginInput>();
  });

  it("should accept a complete native configuration without an instance", () => {
    type CompleteNativeOptions = {
      apiKey: string;
      environment: "development";
      debug: true;
    };

    expectTypeOf<CompleteNativeOptions>().toExtend<RequiredPluginInput>();
  });
});
