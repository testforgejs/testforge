import { test, expectTypeOf } from "vitest";
import { captureInstance } from "../captureInstance.js";

import type { InstanceCapture } from "../../../types.js";

interface MockPluginInstance {
  id: string;
  install(): void;
}

test("should default to unknown when no generic type is provided", () => {
  const capture = captureInstance();

  expectTypeOf(capture).toEqualTypeOf<InstanceCapture<unknown>>();
  expectTypeOf(capture.instance).toEqualTypeOf<unknown>();
});

test("should preserve the explicitly provided instance type", () => {
  const capture = captureInstance<MockPluginInstance>();

  expectTypeOf(capture).toEqualTypeOf<InstanceCapture<MockPluginInstance>>();

  expectTypeOf(capture.instance).toEqualTypeOf<MockPluginInstance | undefined>();
});
