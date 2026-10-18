import { describe, expect, it } from "vitest";

import { SHARED_PLUGIN_INSTANCE_KEY } from "../../../constants/constants.js";
import { getTraversablePluginConfigKeys } from "../getTraversablePluginConfigKeys.js";

describe("getTraversablePluginConfigKeys", () => {
  it("should include enumerable string and symbol keys", () => {
    const symbolKey = Symbol("customOption");

    const config = {
      locale: "en",
      [symbolKey]: "value",
    };

    expect(getTraversablePluginConfigKeys(config)).toEqual(["locale", symbolKey]);
  });

  it("should exclude opaque plugin config keys", () => {
    const sharedInstance = { id: "shared" };

    const config = {
      locale: "en",
      [SHARED_PLUGIN_INSTANCE_KEY]: sharedInstance,
    };

    expect(getTraversablePluginConfigKeys(config)).toEqual(["locale"]);
  });

  it("should exclude non-enumerable properties", () => {
    const symbolKey = Symbol("hiddenOption");

    const config = {
      locale: "en",
    };

    Object.defineProperties(config, {
      hidden: {
        value: "secret",
        enumerable: false,
      },
      [symbolKey]: {
        value: "hidden-symbol",
        enumerable: false,
      },
    });

    expect(getTraversablePluginConfigKeys(config)).toEqual(["locale"]);
  });

  it("should exclude inherited properties", () => {
    const prototype = {
      inherited: "value",
    };

    const config = Object.assign(Object.create(prototype), {
      locale: "en",
    });

    expect(getTraversablePluginConfigKeys(config)).toEqual(["locale"]);
  });
});
