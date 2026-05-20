import { isPluginOverlayObject } from "../isPluginOverlayObject";

declare const value: unknown;

if (isPluginOverlayObject(value)) {
  // TS must understand this is an object
  void value["key"];

  // __meta must be accessible
  void value.__meta;

  // Should NOT be assignable to string
  // @ts-expect-error
  const s: string = value;
}
