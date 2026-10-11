import { test } from "vitest";

import { isPluginOverlayObject } from "../isPluginOverlayObject.js";

import type { PluginMeta } from "../../../../types";

test("should narrow unknown to a plugin overlay object with valid metadata", () => {
  const value: unknown = {};

  if (isPluginOverlayObject(value)) {
    // Narrows unknown to a plugin overlay object.
    const overlay: Record<string, unknown> & {
      __meta?: PluginMeta;
    } = value;

    void overlay;

    // Arbitrary configuration properties must remain accessible.
    void value["key"];

    // Plugin metadata must be accessible with the correct type.
    const meta: PluginMeta | undefined = value.__meta;

    void meta;

    // The narrowed value must not be assignable to a primitive type.
    // @ts-expect-error
    const s: string = value;

    // __meta must not accept arrays.
    // @ts-expect-error
    value.__meta = [];

    // __meta must not accept null.
    // @ts-expect-error
    value.__meta = null;

    // __meta must not accept primitive values.
    // @ts-expect-error
    value.__meta = "invalid";

    // __meta is optional.
    value.__meta = undefined;

    // An empty PluginMeta object is valid.
    value.__meta = {};

    // PluginMeta.instance accepts unknown values.
    value.__meta = { instance: {} };
    value.__meta = { instance: null };
    value.__meta = { instance: 123 };
  }
});
