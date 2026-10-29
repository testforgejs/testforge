import { test } from "vitest";

import { isPluginOverlayObject } from "../isPluginOverlayObject.js";
import { PLUGIN_META_KEY } from "../../../../constants/constants.js";

import type { PluginMeta } from "../../../../types.js";

test("should narrow unknown to a plugin overlay object with valid metadata", () => {
  const value: unknown = {};

  if (isPluginOverlayObject(value)) {
    // Narrows unknown to a plugin overlay object.
    const overlay: Record<string, unknown> & {
      [PLUGIN_META_KEY]?: PluginMeta;
    } = value;

    void overlay;

    // Arbitrary configuration properties must remain accessible.
    void value["key"];

    // Plugin metadata must be accessible with the correct type.
    const meta: PluginMeta | undefined = value[PLUGIN_META_KEY];

    void meta;

    // The narrowed value must not be assignable to a primitive type.
    // @ts-expect-error
    const s: string = value;

    // [PLUGIN_META_KEY] must not accept arrays.
    // @ts-expect-error
    value[PLUGIN_META_KEY] = [];

    // [PLUGIN_META_KEY] must not accept null.
    // @ts-expect-error
    value[PLUGIN_META_KEY] = null;

    // [PLUGIN_META_KEY] must not accept primitive values.
    // @ts-expect-error
    value[PLUGIN_META_KEY] = "invalid";

    // [PLUGIN_META_KEY] is optional.
    value[PLUGIN_META_KEY] = undefined;

    // An empty PluginMeta object is valid.
    value[PLUGIN_META_KEY] = {};

    // PluginMeta.instance accepts unknown values.
    value[PLUGIN_META_KEY] = { instance: {} };
    value[PLUGIN_META_KEY] = { instance: null };
    value[PLUGIN_META_KEY] = { instance: 123 };
  }
});
