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

    optionsOnlyPluginTypeSpec: {
      apiKey: string;
      debug?: boolean;
    };
  }

  interface PluginInstanceMap {
    requiredPluginTypeSpec: {
      install(): void;
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

  it("should reject incompatible plugin instances", () => {
    type InvalidInstanceMetadata = {
      [PLUGIN_META_KEY]: {
        instance: {
          id: string;
        };
      };
    };

    expectTypeOf<InvalidInstanceMetadata>().not.toExtend<RequiredPluginInput>();
  });
});

type OptionsOnlyPluginInput = NonNullable<PluginOptionsInput["optionsOnlyPluginTypeSpec"]>;

describe("PluginOptionsInput without instance support", () => {
  it("should accept complete native options", () => {
    type CompleteNativeOptions = {
      apiKey: string;
      debug: true;
    };

    expectTypeOf<CompleteNativeOptions>().toExtend<OptionsOnlyPluginInput>();
  });

  it("should reject instance metadata", () => {
    type InstanceMetadata = {
      apiKey: string;
      [PLUGIN_META_KEY]: {
        instance: {
          install(): void;
        };
      };
    };

    expectTypeOf<InstanceMetadata>().not.toExtend<OptionsOnlyPluginInput>();
  });

  it("should require native options", () => {
    type MissingRequiredOptions = {
      debug: true;
    };

    expectTypeOf<MissingRequiredOptions>().not.toExtend<OptionsOnlyPluginInput>();
  });
});
